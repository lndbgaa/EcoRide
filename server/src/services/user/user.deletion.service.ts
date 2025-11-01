import bcrypt from "bcrypt";
import dayjs from "dayjs";

import { appConfig, sequelize, transporter } from "@/config";
import { AUTH_ERROR_MESSAGES, USER_ERROR_MESSAGES } from "@/constants";
import { RefreshToken, User } from "@/models/mysql";
import { UserService } from "@/services";
import { AppError, logger, renderTemplate, sendEmail } from "@/utils";

import type { CancelUserDeletionPayload } from "@/types";
import type { Transaction } from "sequelize";

const { clientUrl, gmail } = appConfig;

export class UserDeletionService {
  /**
   * Requests the deletion of a user's account.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<void>}
   *   - The user is not found (thrown by UserService.findById)
   *   - The user has already requested deletion
   */
  public static async requestDeletion(userId: string): Promise<void> {
    const user = await UserService.findById(userId, 500);

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: USER_ERROR_MESSAGES.DELETION_ALREADY_REQUESTED,
      });
    }

    await sequelize.transaction(async (t: Transaction): Promise<void> => {
      await Promise.all([
        user.markAsPendingDeletion({ transaction: t }),
        RefreshToken.update(
          { revoked_at: dayjs().toDate() },
          { where: { user_id: user.id, revoked_at: null }, transaction: t }
        ),
      ]);
    });

    const content = await renderTemplate("deletionRequest.html", {
      firstName: user.first_name || "",
      deletionDate: dayjs(user.pending_deletion_at).add(30, "days").format("DD/MM/YYYY"),
      loginLink: `${clientUrl}/login`,
    });

    try {
      await sendEmail(
        transporter,
        gmail.user,
        user.email,
        "Confirmation de suppression de ton compte - EcoRide",
        content
      );

      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (err) {
      logger.warn("Failed to send deletion confirmation email", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Cancels a previously requested account deletion.
   *
   * @param {CancelUserDeletionPayload} data - The user's credentials for validation.
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The user is not found
   *   - The provided password is incorrect
   *   - No pending deletion request exists for the user
   *   - The 30-day deletion period has expired
   */
  public static async cancelDeletion(data: CancelUserDeletionPayload): Promise<void> {
    const { email, password } = data;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      await bcrypt.hash(password, 10);
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    if (!(await user.checkPassword(password))) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    if (!user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.NO_DELETION_REQUESTED,
      });
    }

    const expirationDate = dayjs(user.pending_deletion_at).add(30, "days");
    if (dayjs().isAfter(expirationDate)) {
      throw new AppError({
        statusCode: 410,
        userMessageKey: USER_ERROR_MESSAGES.DELETION_PERIOD_EXPIRED,
      });
    }

    await user.markAsActive();

    const content = await renderTemplate("accountReactivated.html", {
      firstName: user.first_name || "",
      loginLink: `${clientUrl}/login`,
      contactLink: `${clientUrl}/contact`,
    });

    try {
      await sendEmail(transporter, gmail.user, user.email, "Réactivation de ton compte - EcoRide", content);

      // TODO ajouter i18n pour l'email
      // FIXME mettre un retry automatique pour sendEmail
    } catch (err) {
      logger.warn("Failed to send account deletion cancellation email", {
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
