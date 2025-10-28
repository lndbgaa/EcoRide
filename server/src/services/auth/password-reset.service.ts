import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Op } from "sequelize";

import { appConfig, sequelize, transporter } from "@/config";
import { ERROR_MESSAGES } from "@/constants";
import { PasswordResetToken, User } from "@/models/mysql";
import { AppError, renderTemplate, sendEmail } from "@/utils";

import type { ResetPasswordPayload } from "@/types";

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

    const now = dayjs();
    const nowDate = now.toDate();

    const token = await sequelize.transaction(async (t): Promise<string> => {
      await PasswordResetToken.update(
        { used_at: nowDate },
        { where: { user_id: user.id, used_at: null, expires_at: { [Op.gt]: nowDate } }, transaction: t }
      );

      const tokenRecord = await PasswordResetToken.create(
        {
          token: nanoid(32),
          user_id: user.id,
          expires_at: now.add(1, "hour").toDate(),
        },
        { transaction: t }
      );

      return tokenRecord.token;
    });

    const link = `${clientUrl}/reset-password?token=${token}`;
    const content = await renderTemplate("resetPassword.html", {
      firstName: user.first_name || "",
      resetLink: link,
    });

    try {
      await sendEmail(transporter, gmail.user, user.email, "Réinitialisation de ton mot de passe – EcoRide", content);
      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (error) {
      // FIXME logging des erreurs

      await PasswordResetToken.destroy({ where: { token } });

      throw new AppError({
        statusCode: 500,
        userMessage: ERROR_MESSAGES.AUTH.PASSWORD_RESET_SEND_FAILED,
      });
    }
  }

  /**
   * Verifies a password reset token.
   
   * @param {string} token - The token to verify.
   * @returns {Promise<PasswordResetToken>}
   * @throws {AppError} - If the token is invalid, expired, or already used
   */
  public static async verifyResetToken(token: string): Promise<PasswordResetToken> {
    const tokenRecord = await PasswordResetToken.findOne({ where: { token } });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new AppError({
        statusCode: 400,
        userMessage: ERROR_MESSAGES.AUTH.PASSWORD_RESET_TOKEN_INVALID,
        debugMessage: "Password reset token is invalid or has expired",
      });
    }

    return tokenRecord;
  }

  /**
   * Resets the user's password.
   
   * @param {ResetPasswordPayload} data - The data to reset the password.
   * @returns {Promise<void>}
   * @throws {AppError} - If the token is invalid, expired, already used or the user does not exist.
   * @note The password is hashed automatically before being saved via a Sequelize hook.
   */
  public static async resetPassword(data: ResetPasswordPayload): Promise<void> {
    const { token, newPassword } = data;

    const tokenRecord = await this.verifyResetToken(token);

    const user = await User.findByPk(tokenRecord.user_id);

    if (!user) {
      throw new AppError({
        statusCode: 400,
        userMessage: ERROR_MESSAGES.AUTH.PASSWORD_RESET_TOKEN_INVALID,
        debugMessage: "User not found for password reset token",
      });
    }

    return sequelize.transaction(async (t): Promise<void> => {
      user.password = newPassword;
      await user.save({ transaction: t, fields: ["password"] });
      await tokenRecord.markAsUsed({ transaction: t });
    });
  }
}

export { PasswordResetService };
