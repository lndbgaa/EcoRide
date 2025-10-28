import dayjs from "dayjs";
import { nanoid } from "nanoid";

import { appConfig, sequelize, transporter } from "@/config";
import { ERROR_MESSAGES } from "@/constants";
import { EmailVerificationToken, User } from "@/models/mysql";
import { AppError, logger, renderTemplate, sendEmail } from "@/utils";

const { clientUrl, gmail } = appConfig;

class EmailVerificationService {
  public static async sendVerificationLinkToUser(user: User): Promise<void> {
    if (user.is_verified) {
      throw new AppError({
        statusCode: 400,
        userMessage: ERROR_MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED,
      });
    }

    const token = await sequelize.transaction(async (t): Promise<string> => {
      await EmailVerificationToken.update(
        { used_at: dayjs().toDate() },
        { where: { user_id: user.id, used_at: null }, transaction: t }
      );

      const tokenRecord = await EmailVerificationToken.create(
        {
          token: nanoid(32),
          user_id: user.id,
          expires_at: dayjs().add(1, "day").toDate(),
        },
        { transaction: t }
      );

      return tokenRecord.token;
    });

    const link = `${clientUrl}/verify-email?token=${token}`;
    const content = await renderTemplate("emailVerification.html", {
      firstName: user.first_name || "",
      verificationLink: link,
    });

    try {
      await sendEmail(transporter, gmail.user, user.email, "Vérifie ton adresse email", content);
      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (err) {
      logger.warn("Email verification sending failed", {
        userId: user.id,
        provider: "nodemailer",
      });

      await EmailVerificationToken.destroy({ where: { token } });

      throw new AppError({
        statusCode: 500,
        userMessage: ERROR_MESSAGES.AUTH.EMAIL_VERIFICATION_SEND_FAILED,
      });
    }
  }

  public static async sendVerificationLinkByEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });

    if (!user || user.is_verified) return;

    await this.sendVerificationLinkToUser(user);
  }

  public static async verifyEmail(token: string): Promise<void> {
    const tokenRecord = await EmailVerificationToken.findOne({ where: { token } });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new AppError({
        statusCode: 400,
        userMessage: ERROR_MESSAGES.AUTH.EMAIL_VERIFICATION_TOKEN_INVALID,
        debugMessage: "Email verification token is invalid or has expired",
      });
    }

    const user = await User.findByPk(tokenRecord.user_id);

    if (!user) {
      throw new AppError({
        statusCode: 400,
        userMessage: ERROR_MESSAGES.AUTH.EMAIL_VERIFICATION_TOKEN_INVALID,
        debugMessage: "User not found for email verification token",
      });
    }

    return sequelize.transaction(async (t): Promise<void> => {
      await tokenRecord.markAsUsed({ transaction: t });
      await user.markAsVerified({ transaction: t });
    });
  }
}

export { EmailVerificationService };
