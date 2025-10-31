import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Op, Transaction } from "sequelize";

import { appConfig, sequelize, transporter } from "@/config";
import {
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  DEBUG_CODES,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_TOKEN_LENGTH,
} from "@/constants";
import { PasswordResetToken, User } from "@/models/mysql";
import { AppError, renderTemplate, sendEmail } from "@/utils";

import type { ResetPasswordPayload } from "@/types";
import type { FindOptions } from "sequelize";

const { clientUrl, gmail } = appConfig;

class PasswordResetService {
  /**
   * Sends a password reset link by email.
   
   * @param {string} email - The user's email.
   * @returns {Promise<void>}
   * @throws {AppError} - If sending the email fails.
   * @note Returns silently if the user does not exist.
   */
  public static async sendPasswordResetLinkByEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user) return;

    const token = await this.createResetToken(user.id);
    const link = `${clientUrl}/reset-password?token=${token}`;
    const content = await renderTemplate("resetPassword.html", {
      firstName: user.first_name || "",
      resetLink: link,
    });

    try {
      await sendEmail(
        transporter,
        gmail.user,
        user.email,
        "Réinitialisation de ton mot de passe – EcoRide",
        content
      );
      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (err) {
      // FIXME logging des erreurs

      await PasswordResetToken.destroy({ where: { token } });

      throw new AppError({
        statusCode: 500,
        userMessageKey: AUTH_ERROR_MESSAGES.PASSWORD_RESET_SEND_FAILED,
        debugMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Verifies a password reset token.
   
   * @param {string} token - The token to verify.
   * @returns {Promise<PasswordResetToken>}
   * @throws {AppError} - If the token is not found, expired, or already used
   */
  public static async verifyResetToken(token: string, options?: FindOptions): Promise<PasswordResetToken> {
    const tokenRecord = await PasswordResetToken.findOne({ where: { token }, ...options });

    if (!tokenRecord) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
        debugMessage: "Password reset token not found",
        code: AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_INVALID,
        debugCode: DEBUG_CODES.AUTH.PASSWORD_RESET_TOKEN_NOT_FOUND,
      });
    }

    if (!tokenRecord.isValid()) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
        debugMessage: tokenRecord.used_at
          ? "Password reset token already used"
          : "Password reset token expired",
        code: AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_INVALID,
        debugCode: tokenRecord.used_at
          ? DEBUG_CODES.AUTH.PASSWORD_RESET_TOKEN_ALREADY_USED
          : DEBUG_CODES.AUTH.PASSWORD_RESET_TOKEN_EXPIRED,
      });
    }

    return tokenRecord;
  }

  /**
   * Resets the user's password.
   
   * @param {ResetPasswordPayload} data - The data to reset the password.
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The token is not found, expired, or already used
   *   - The associated user does not exist
   * @note The password is hashed automatically before being saved via a Sequelize hook.
   */
  public static async resetPassword(data: ResetPasswordPayload): Promise<void> {
    const { token, password } = data;

    await sequelize.transaction(async (t: Transaction): Promise<void> => {
      const tokenRecord = await this.verifyResetToken(token, { transaction: t, lock: true });

      const user = await User.findByPk(tokenRecord.user_id, { transaction: t, lock: true });

      if (!user) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: AUTH_ERROR_MESSAGES.PASSWORD_RESET_TOKEN_INVALID,
          debugMessage: "User not found for valid password reset token",
          code: AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_INVALID,
          debugCode: DEBUG_CODES.USER.NOT_FOUND,
        });
      }

      user.password = password;

      await Promise.all([
        user.save({ transaction: t, fields: ["password"] }),
        tokenRecord.markAsUsed({ transaction: t }),
      ]);
    });
  }

  /**
   * Creates a new password reset token for a user and invalidates existing valid tokens.
   *
   * @param {string} userId - The user ID to create the token for.
   * @returns {Promise<string>} - The generated token string.
   * @private
   */
  private static async createResetToken(userId: string): Promise<string> {
    const now = dayjs();
    const nowDate = now.toDate();

    return sequelize.transaction(async (t: Transaction): Promise<string> => {
      await PasswordResetToken.update(
        { used_at: nowDate },
        {
          where: {
            user_id: userId,
            used_at: null,
            expires_at: { [Op.gt]: nowDate },
          },
          transaction: t,
        }
      );

      const tokenRecord = await PasswordResetToken.create(
        {
          token: nanoid(PASSWORD_RESET_TOKEN_LENGTH),
          user_id: userId,
          expires_at: now.add(PASSWORD_RESET_TOKEN_EXPIRY_HOURS, "hour").toDate(),
        },
        { transaction: t }
      );

      return tokenRecord.token;
    });
  }
}

export { PasswordResetService };
