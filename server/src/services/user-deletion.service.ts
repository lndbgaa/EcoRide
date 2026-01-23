import bcrypt from "bcrypt";
import { Op, col, fn, where } from "sequelize";

import { appConfig, dayjs, sequelize } from "@/config";
import {
  AUTH_ERROR_MESSAGES,
  BOOKING_STATUSES,
  DUMMY_PASSWORD_HASH,
  TRIP_STATUSES,
  USER_ACCOUNT_DELETION_DELAY_DAYS,
  USER_ERROR_MESSAGES,
  USER_STATUSES,
} from "@/constants";
import { Booking, EmailVerificationToken, PasswordResetToken, Preference, RefreshToken, Trip, User, Vehicle } from "@/models";
import { EmailService } from "@/services";
import { AppError, logger, renderTemplate } from "@/utils";

import type { CancelUserDeletionPayload } from "@/types";

const { clientUrl, gmail } = appConfig;

export class UserDeletionService {
  /**
   * Requests the deletion of a user's account.
   *
   * @param {User} user
   * @returns {Promise<void>}
   * @throws {AppError} 409 if user has already requested deletion.
   * @throws {AppError} 409 if user has active trips or bookings preventing deletion.
   */
  public static async requestDeletion(user: User): Promise<void> {
    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: USER_ERROR_MESSAGES.DELETION_ALREADY_REQUESTED,
      });
    }

    const activeTrip = await Trip.findOne({
      where: {
        driver_id: user.id,
        status: { [Op.notIn]: [TRIP_STATUSES.CANCELLED, TRIP_STATUSES.COMPLETED] },
      },
      attributes: ["id"],
      limit: 1,
    });

    const activeBooking = await Booking.findOne({
      where: {
        passenger_id: user.id,
        status: { [Op.in]: [BOOKING_STATUSES.CONFIRMED] },
      },
      attributes: ["id"],
      limit: 1,
    });

    if (activeTrip || activeBooking) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: USER_ERROR_MESSAGES.HAS_ACTIVE_RIDES_OR_BOOKINGS,
      });
    }

    await sequelize.transaction(async (t): Promise<void> => {
      await Promise.all([
        user.markAsPendingDeletion({ transaction: t }),

        RefreshToken.update({ revoked_at: dayjs().toDate() }, { where: { user_id: user.id, revoked_at: null }, transaction: t }),
      ]);
    });

    const content = await renderTemplate("user.account-deletion-request.html", {
      firstName: user.first_name || "",
      deletionDate: dayjs(user.pending_deletion_at).add(USER_ACCOUNT_DELETION_DELAY_DAYS, "days").format("DD/MM/YYYY"),
      loginLink: `${clientUrl}/login`,
    });

    try {
      await EmailService.sendEmail(gmail.user, user.email, "Confirmation de suppression de ton compte - EcoRide", content);
      // TODO ajouter système de traduction pour email
    } catch (err) {
      logger.warn("Failed to send deletion confirmation email", {
        email: user?.email,
        userId: user.id,
        debugMessage: err instanceof AppError ? err.debugMessage : err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  }

  /**
   * Cancels a previously requested account deletion.
   *
   * @param {CancelUserDeletionPayload} data - The user's credentials for validation.
   * @returns {Promise<void>}
   * @throws {AppError} 401 if user is not found or provided password is incorrect.
   * @throws {AppError} 409 if no pending deletion request exists for user.
   * @throws {AppError} 410 if 30-day deletion period has expired.
   */
  public static async cancelDeletion(data: CancelUserDeletionPayload): Promise<void> {
    const { email, password } = data;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
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
        statusCode: 409,
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

    const content = await renderTemplate("user.account-reactivation.html", {
      firstName: user.first_name || "",
      loginLink: `${clientUrl}/login`,
      contactLink: `${clientUrl}/contact`,
    });

    try {
      await EmailService.sendEmail(gmail.user, user.email, "Réactivation de ton compte - EcoRide", content);
      // TODO ajouter système de traduction pour email
    } catch (err) {
      logger.warn("Failed to send account deletion cancellation email", {
        email: user?.email,
        userId: user.id,
        debugMessage: err instanceof AppError ? err.debugMessage : err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  }

  /**
   * Finds all users whose account deletion request has expired (past the deletion delay period).
   *
   * @returns {Promise<User[]>} A list of users whose pending deletion date is older than the configured deletion delay.
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
   * @param {string} user
   * @returns {Promise<void>}
   */
  public static async deletePermanently(user: User): Promise<void> {
    await sequelize.transaction(async (t) => {
      await Promise.all([
        RefreshToken.destroy({ where: { user_id: user.id }, transaction: t }),
        EmailVerificationToken.destroy({ where: { user_id: user.id }, transaction: t }),
        PasswordResetToken.destroy({ where: { user_id: user.id }, transaction: t }),
        Preference.destroy({ where: { user_id: user.id }, transaction: t }),
      ]);

      const vehicles = await Vehicle.findAll({ where: { owner_id: user.id }, transaction: t });
      await Promise.all(vehicles.map((v) => v.markAsDeleted({ transaction: t })));

      const hashedPassword = await bcrypt.hash(`deleted_${user.id}`, 10);

      await User.update(
        {
          email: `deleted_user_${user.id}@anonymized.local`,
          username: `deleted_user_${user.id}`,
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
          email_is_verified: false,
          last_login: null,
          pending_deletion_at: null,
          deleted_at: dayjs().toDate(),
        },
        { where: { id: user.id }, transaction: t }
      );
    });
  }
}
