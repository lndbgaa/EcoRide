import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Op, Transaction } from "sequelize";

import { appConfig, sequelize, transporter } from "@/config";
import {
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  DEBUG_CODES,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_DAYS,
  EMAIL_VERIFICATION_TOKEN_LENGTH,
} from "@/constants";
import { EmailVerificationToken, User } from "@/models/mysql";
import { AppError, renderTemplate, sendEmail } from "@/utils";

const { clientUrl, gmail } = appConfig;

class EmailVerificationService {
  /**
   * Sends a verification link to a user.
   *
   * @param {User} user - The user to send the verification link to.
   * @returns {Promise<void>}
   * @throws {AppError} - If the user is already verified or if sending the email fails.
   */
  public static async sendVerificationLinkToUser(user: User): Promise<void> {
    if (user.is_verified) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_EMAIL_ALREADY_VERIFIED,
      });
    }

    const token = await this.createVerificationToken(user.id);
    const link = `${clientUrl}/verify-email?token=${token}`;
    const content = await renderTemplate("emailVerification.html", {
      firstName: user.first_name || "",
      verificationLink: link,
    });

    try {
      await sendEmail(transporter, gmail.user, user.email, "Vérifie ton adresse email - EcoRide", content);
      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (err) {
      // FIXME logging des erreurs

      await EmailVerificationToken.destroy({ where: { token } });

      throw new AppError({
        statusCode: 500,
        userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_SEND_FAILED,
        debugMessage: err instanceof Error ? err.message : String(err),
        code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_SEND_FAILED,
      });
    }
  }

  /**
   * Sends a verification link by email (for resend).
   *
   * @param {string} email - The user's email.
   * @returns {Promise<void>}
   * @throws {AppError} - If sending the email fails.
   * @note Returns silently if the user does not exist or is already verified.
   */
  public static async sendVerificationLinkByEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user || user.is_verified) return;

    await this.sendVerificationLinkToUser(user);
  }

  /**
   * Verifies the email verification token.
   *
   * @param {string} token - The token to verify.
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The token is not found, expired, or already used
   *   - The associated user does not exist
   */
  public static async verifyEmail(token: string): Promise<void> {
    const tokenRecord = await EmailVerificationToken.findOne({ where: { token } });

    if (!tokenRecord) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
        debugMessage: "Email verification token not found",
        code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
        debugCode: DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_NOT_FOUND,
      });
    }

    if (!tokenRecord.isValid()) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
        debugMessage: tokenRecord.used_at
          ? "Email verification token already used"
          : "Email verification token expired",
        code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
        debugCode: tokenRecord.used_at
          ? DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_ALREADY_USED
          : DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_EXPIRED,
      });
    }

    await sequelize.transaction(async (t: Transaction): Promise<void> => {
      const user = await User.findByPk(tokenRecord.user_id, {
        transaction: t,
        lock: true,
      });

      if (!user) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
          debugMessage: "User not found for valid email verification token",
          code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
          debugCode: DEBUG_CODES.USER.NOT_FOUND,
        });
      }

      await Promise.all([
        tokenRecord.markAsUsed({ transaction: t }),
        user.markAsVerified({ transaction: t }),
      ]);
    });
  }

  /**
   * Creates a new verification token for a user and invalidates existing valid tokens.
   *
   * @param {string} userId - The user ID to create the token for.
   * @returns {Promise<string>} - The generated token string.
   * @private
   */
  private static async createVerificationToken(userId: string): Promise<string> {
    const now = dayjs();
    const nowDate = now.toDate();

    return sequelize.transaction(async (t: Transaction): Promise<string> => {
      await EmailVerificationToken.update(
        { used_at: nowDate },
        { where: { user_id: userId, used_at: null, expires_at: { [Op.gt]: nowDate } }, transaction: t }
      );

      const tokenRecord = await EmailVerificationToken.create(
        {
          token: nanoid(EMAIL_VERIFICATION_TOKEN_LENGTH),
          user_id: userId,
          expires_at: now.add(EMAIL_VERIFICATION_TOKEN_EXPIRY_DAYS, "day").toDate(),
        },
        { transaction: t }
      );

      return tokenRecord.token;
    });
  }
}

export { EmailVerificationService };
