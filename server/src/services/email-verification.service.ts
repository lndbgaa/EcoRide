import { nanoid } from "nanoid";
import { Op } from "sequelize";

import { appConfig, dayjs, sequelize } from "@/config";
import {
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  DEBUG_CODES,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_DAYS,
  EMAIL_VERIFICATION_TOKEN_LENGTH,
} from "@/constants";
import { EmailVerificationToken, User } from "@/models";
import { EmailService } from "@/services";
import { AppError, logger, renderTemplate } from "@/utils";

const { clientUrl, gmail } = appConfig;

export class EmailVerificationService {
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

    return sequelize.transaction(async (t) => {
      await EmailVerificationToken.update(
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

  /**
   * Sends a verification link to a user.
   *
   * @param {User} user - The user to send the verification link to.
   * @returns {Promise<void>}
   * @throws {AppError} 400 if user is already verified.
   */
  public static async sendVerificationLinkToUser(user: User): Promise<void> {
    if (user.email_is_verified) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_EMAIL_ALREADY_VERIFIED,
      });
    }

    const token = await this.createVerificationToken(user.id);
    const link = `${clientUrl}/verify-email?token=${token}`;
    const content = await renderTemplate("user.email-verification.html", {
      firstName: user.first_name || "",
      verificationLink: link,
    });

    try {
      await EmailService.sendEmail(gmail.user, user.email, "Vérifie ton adresse email - EcoRide", content);
      // TODO ajouter système de traduction pour email
    } catch (err) {
      await EmailVerificationToken.destroy({ where: { token } });
      throw err;
    }
  }

  /**
   * Sends a verification link by email (for resend).
   *
   * - Returns silently if the user does not exist, is already verified, or if sending the email fails.
   * - Ensures a minimum response time to prevent revealing whether the email exists.
   *
   * @param {string} email - The user's email.
   * @returns {Promise<void>}
   */
  public static async sendVerificationLinkByEmail(email: string): Promise<void> {
    const MIN_DELAY_MS = 700;
    const startTime = dayjs();
    let user: User | null = null;

    try {
      user = await User.findOne({ where: { email } });

      if (user && !user.email_is_verified) {
        await this.sendVerificationLinkToUser(user);
      }
    } catch (err) {
      logger.error("Failed to send verification email (silent fail)", {
        service: "EmailVerificationService",
        email: user?.email,
        userId: user?.id,
        debugMessage: err instanceof AppError ? err.debugMessage : err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    } finally {
      const elapsed = dayjs().diff(startTime, "millisecond");

      if (elapsed < MIN_DELAY_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS - elapsed));
      }
    }
  }

  /**
   * Verifies the email verification token.
   *
   * @param {string} token - The token to verify.
   * @returns {Promise<void>}
   * @throws {AppError} 400 if token is not found, expired, or already used.
   * @throws {AppError} 500 if associated user does not exist.
   */
  public static async verifyEmail(token: string): Promise<void> {
    await sequelize.transaction(async (t) => {
      const tokenRecord = await EmailVerificationToken.findOne({
        where: { token },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!tokenRecord) {
        throw new AppError({
          statusCode: 400,
          userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
          debugMessage: "[EmailVerificationService.verifyEmail] Email verification token not found.",
          code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
          debugCode: DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_NOT_FOUND,
        });
      }

      if (!tokenRecord.isValid()) {
        throw new AppError({
          statusCode: 400,
          userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
          debugMessage: `[EmailVerificationService.verifyEmail] ${
            tokenRecord.used_at ? "Email verification token already used." : "Email verification token expired."
          }`,
          code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
          debugCode: tokenRecord.used_at
            ? DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_ALREADY_USED
            : DEBUG_CODES.AUTH.EMAIL_VERIFICATION_TOKEN_EXPIRED,
        });
      }

      const user = await User.findByPk(tokenRecord.user_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!user) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_FAILED,
          debugMessage: "[EmailVerificationService.verifyEmail] User not found for valid email verification token.",
          code: AUTH_ERROR_CODES.EMAIL_VERIFICATION_FAILED,
          debugCode: DEBUG_CODES.USER.NOT_FOUND,
        });
      }

      await Promise.all([tokenRecord.markAsUsed({ transaction: t }), user.markEmailAsVerified({ transaction: t })]);
    });
  }
}
