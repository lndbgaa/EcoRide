import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { Op, col, fn, where } from "sequelize";

import { appConfig, sequelize, transporter } from "@/config";
import {
  AUTH_ERROR_MESSAGES,
  BOOKING_STATUSES,
  RIDE_STATUSES,
  USER_ACCOUNT_DELETION_DELAY_DAYS,
  USER_ERROR_MESSAGES,
  USER_STATUSES,
} from "@/constants";
import {
  Booking,
  EmailVerificationToken,
  PasswordResetToken,
  Preference,
  RefreshToken,
  Ride,
  User,
  Vehicle,
} from "@/models/mysql";
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
   * @throws {AppError} - If:
   *   - The user is not found (thrown by UserService.findById)
   *   - The user has already requested deletion
   *   - The user has active rides or bookings preventing deletion
   */
  public static async requestDeletion(userId: string): Promise<void> {
    const user = await UserService.findById(userId, 500);

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: USER_ERROR_MESSAGES.DELETION_ALREADY_REQUESTED,
      });
    }

    const activeRide = await Ride.findOne({
      where: {
        driver_id: userId,
        status: { [Op.in]: [RIDE_STATUSES.OPEN, RIDE_STATUSES.FULL, RIDE_STATUSES.IN_PROGRESS] },
      },
    });

    const activeBooking = await Booking.findOne({
      where: {
        passenger_id: userId,
        status: { [Op.in]: [BOOKING_STATUSES.CONFIRMED] },
      },
    });

    if (activeRide || activeBooking) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.HAS_ACTIVE_RIDES_OR_BOOKINGS,
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
      deletionDate: dayjs(user.pending_deletion_at)
        .add(USER_ACCOUNT_DELETION_DELAY_DAYS, "days")
        .format("DD/MM/YYYY"),
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

    const expirationDate = dayjs(user.pending_deletion_at).add(USER_ACCOUNT_DELETION_DELAY_DAYS, "days");
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

  /**
   * Finds all users whose account deletion request has expired (past the deletion delay period).
   *
   * @returns {Promise<User[]>} - A list of users whose pending deletion date is older than the configured deletion delay.
   * @notes - Compares only the date (YYYY-MM-DD) in the database (ignoring time and timezone) to retrieve all users whose deletion period has expired.
   */
  public static async findExpiredDeletionRequests(): Promise<User[]> {
    const expirationDateStr = dayjs().subtract(USER_ACCOUNT_DELETION_DELAY_DAYS, "day").format("YYYY-MM-DD");

    return await User.findAll({
      where: {
        status: USER_STATUSES.PENDING_DELETION,
        [Op.and]: where(fn("DATE", col("pending_deletion_at")), "<=", expirationDateStr),
      },
    });
  }

  /**
   * Permanently deletes a user's account and anonymizes their personal data.
   *
   * @param {string} userId - The ID of the user to delete.
   * @returns {Promise<void>}
   */
  public static async deletePermanently(userId: string): Promise<void> {
    await sequelize.transaction(async (t: Transaction) => {
      await Promise.all([
        RefreshToken.destroy({ where: { user_id: userId }, transaction: t }),
        EmailVerificationToken.destroy({ where: { user_id: userId }, transaction: t }),
        PasswordResetToken.destroy({ where: { user_id: userId }, transaction: t }),
        Vehicle.destroy({ where: { owner_id: userId }, transaction: t }),
        Preference.destroy({ where: { user_id: userId }, transaction: t }),
      ]);

      const hashedPassword = await bcrypt.hash(`deleted_${userId}`, 10);

      await User.update(
        {
          email: `deleted_user_${userId}@anonymized.local`,
          username: `deleted_user_${userId}`,
          password: hashedPassword,
          first_name: null,
          last_name: null,
          phone: null,
          address: null,
          birth_date: null,
          profile_picture: null,
          average_rating: null,
          credits: 0,
          status: USER_STATUSES.DELETED,
          is_verified: false,
          last_login: null,
          pending_deletion_at: null,
          deleted_at: dayjs().toDate(),
        },
        { where: { id: userId }, transaction: t }
      );
    });
  }
}
