import { Op } from "sequelize";

import { dayjs, sequelize } from "@/config";
import {
  BOOKING_ERROR_MESSAGES,
  BOOKING_MIN_MINUTES_BEFORE_CANCELLATION,
  BOOKING_STATUSES,
  COMMON_ERROR_MESSAGES,
  PLATFORM_FEE_PER_SEAT,
} from "@/constants";
import { Booking, Incident, User } from "@/models";
import { IncidentService, TripService } from "@/services";
import { AppError } from "@/utils";

import type {
  BookingDBFilter,
  CreateBookingPayload,
  GetBookingsFilters,
  GetBookingsResponse,
  GetBookingsSortOptions,
  IncidentDocument,
  ReportBookingIncidentPayload
} from "@/types";
import type { FindOptions, Order, WhereOptions } from "sequelize";

export class BookingService {
  /**
   * Finds a booking by ID, ensuring it belongs to a given user.
   *
   * @param {string} userId
   * @param {string} bookingId
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Booking>} Returned booking instance.
   * @throws {AppError} 404 if booking does not exist or does not belong to user.
   */
  public static async findOwnedById(userId: string, bookingId: string, options?: FindOptions): Promise<Booking> {
    const booking = await Booking.findOne({
      where: { id: bookingId, passenger_id: userId },
      ...options,
    });

    if (!booking) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[BookingService.findOwnedById] Booking '${bookingId}' not found or ownership check failed for user '${userId}.'`,
      });
    }

    return booking;
  }

  /**
   * Retrieves all bookings with pagination, optional filters, and sorting.
   *
   * @param {number} limit - Maximum number of bookings to return.
   * @param {number} offset - Number of bookings to skip (for pagination).
   * @param {GetBookingsFilters} [filters] - Optional filters:
   *  - status: single status or an array of statuses
   *  - passengerId: filter bookings by passenger ID
   * @param {GetBookingsSortOptions} [sortOptions] - Optional sort options:
   *  - by: 'createdAt' | 'departureDate' (default: 'createdAt')
   *  - dir: 'asc' | 'desc' (default: 'desc')
   *  Note: Sorting by 'departureDate' requires the 'trip' association to be included.
   * @param {Partial<FindOptions>} [options] - Additional Sequelize find options (include, attributes, etc.).
   * @returns {Promise<GetBookingsResponse>} Object containing total count and list of bookings.
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetBookingsFilters,
    sortOptions?: GetBookingsSortOptions,
    options?: Partial<FindOptions>
  ): Promise<GetBookingsResponse> {
    const where: WhereOptions<BookingDBFilter> = {};

    if (filters?.status) where.status = Array.isArray(filters.status) ? { [Op.in]: filters.status } : filters.status;
    if (filters?.passengerId) where.passenger_id = filters.passengerId;

    const sortDirection = sortOptions?.dir === "asc" ? "ASC" : "DESC";
    const order: Order =
      sortOptions?.by === "departureDate" ? [["trip", "departure_datetime", sortDirection]] : [["created_at", sortDirection]];

    const { count, rows } = await Booking.findAndCountAll({
      where,
      limit,
      offset,
      order,
      ...options,
      distinct: true,
    });

    return { count, bookings: rows };
  }

  /**
   * Creates a booking for a given user.
   *
   * @param {User} user
   * @param {CreateBookingPayload} data
   * @returns {Promise<Booking>} Newly created booking with trip relation loaded.
   * @throws {AppError} 404 if trip is not found (from TripService.findById).
   * @throws {AppError} 409 if user is the driver of the trip.
   * @throws {AppError} 409 if trip is not open for bookings.
   * @throws {AppError} 409 if there are not enough available seats.
   * @throws {AppError} 402 if user has insufficient credits.
   * @throws {AppError} 409 if user already has an active booking for this trip.
   */
  public static async create(user: User, data: CreateBookingPayload): Promise<Booking> {
    const { tripId, seatsToBook } = data;

    return await sequelize.transaction(async (t) => {
      await user.reload({ lock: true, transaction: t });

      const trip = await TripService.findById(tripId, {
        lock: true,
        transaction: t,
      });

      if (trip.driver_id === user.id) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.IS_DRIVER,
          debugMessage: `Cannot create booking: User '${user.id}' is the driver of trip '${tripId}'.`,
        });
      }

      if (!trip.isOpen()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.TRIP_NOT_OPEN,
          debugMessage: `Cannot create booking: Trip '${tripId}' is not open for bookings (current status: ${trip.status}).`,
        });
      }

      if (trip.available_seats < seatsToBook) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.NOT_ENOUGH_SEATS,
          userMessageParams: { available: trip.available_seats },
          debugMessage: `Cannot create booking: Trip '${tripId}' has ${trip.available_seats} seat(s) available, ${seatsToBook} requested.`,
        });
      }

      const tripPrice = trip.price;
      const totalPrice = tripPrice * seatsToBook;

      if (user.credits < totalPrice) {
        throw new AppError({
          statusCode: 402,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.INSUFFICIENT_CREDITS,
          userMessageParams: { required: totalPrice },
          debugMessage: `Cannot create booking: User '${user.id}' has ${user.credits} credit(s), ${totalPrice} required.`,
        });
      }

      const existingBooking = await Booking.findOne({
        where: {
          trip_id: tripId,
          passenger_id: user.id,
          status: BOOKING_STATUSES.CONFIRMED,
        },
        attributes: ["id"],
        transaction: t,
      });

      if (existingBooking) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.ALREADY_BOOKED,
          debugMessage: `Cannot create booking: User '${user.id}' already has an active booking for trip '${tripId}'.`,
        });
      }

      const booking = await Booking.create(
        {
          trip_id: trip.id,
          passenger_id: user.id,
          seats_booked: seatsToBook,
        },
        { transaction: t }
      );

      await trip.removeAvailableSeats(seatsToBook, {
        transaction: t,
      });

      await user.removeCredits(totalPrice, { transaction: t });

      await booking.reload({
        include: [{ association: "trip" }],
        transaction: t,
      });

      return booking;
    });
  }

  /**
   * Cancels a booking owned by a given user.
   *
   * @param {User} user
   * @param {string} bookingId
   * @returns {Promise<Booking>} Updated booking with status set to cancelled.
   * @throws {AppError} 404 if booking does not exist or does not belong to user (from this.findOwnedById()).
   * @throws {AppError} 409 if booking is already cancelled.
   * @throws {AppError} 409 if booking is not in a confirmed state.
   * @throws {AppError} 500 if required relations (trip) are missing.
   * @throws {AppError} 409 if cancellation is attempted too close to departure.
   */
  public static async cancel(user: User, bookingId: string): Promise<Booking> {
    return await sequelize.transaction(async (t) => {
      const booking = await this.findOwnedById(user.id, bookingId, {
        include: [{ association: "trip" }],
        lock: true,
        transaction: t,
      });

      if (booking.isCancelled()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.ALREADY_CANCELLED,
          debugMessage: `Cannot cancel booking '${bookingId}': already cancelled.`,
        });
      }

      if (!booking.isConfirmed()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.INVALID_STATUS,
          debugMessage: `Cannot cancel booking '${bookingId}': current status is ${booking.status}.`,
        });
      }

      const { trip } = booking;

      if (!trip) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `Missing relations for booking '${bookingId}': trip=${!!trip}.`,
        });
      }

      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesBeforeDeparture = departure.diff(now, "minute");

      if (minutesBeforeDeparture < BOOKING_MIN_MINUTES_BEFORE_CANCELLATION) {
        const hoursBeforeCancellation = BOOKING_MIN_MINUTES_BEFORE_CANCELLATION / 60;

        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.TOO_CLOSE,
          userMessageParams: { hours: hoursBeforeCancellation },
          debugMessage: `Cannot cancel booking '${bookingId}': too close to departure (${minutesBeforeDeparture} min remaining). Minimum required: ${BOOKING_MIN_MINUTES_BEFORE_CANCELLATION} minutes.`,
        });
      }

      const seatsBooked = booking.seats_booked;
      const refund = trip.price * seatsBooked;

      await booking.markAsCancelled({ transaction: t });
      await trip.addAvailableSeats(seatsBooked, { transaction: t });
      await user.addCredits(refund, { transaction: t });

      return booking;
    });
  }

  /**
   * Completes a booking owned by a given user and credits the driver.
   *
   * This method finalizes a booking after the trip has ended and the passenger
   * has provided feedback. The driver receives the trip earnings minus platform fees.
   *
   * @param {User} user.
   * @param {string} bookingId
   * @returns {Promise<Booking>} Updated booking with status set to completed.
   * @throws {AppError} 404 if booking does not exist or does not belong to user (from this.findOwnedById()).
   * @throws {AppError} 409 if booking is already completed.
   * @throws {AppError} 409 if booking is not in 'awaiting_feedback' status.
   * @throws {AppError} 500 if required relations (trip or driver) are missing.
   */
  public static async complete(user: User, bookingId: string): Promise<Booking> {
    return await sequelize.transaction(async (t) => {
      const booking = await this.findOwnedById(user.id, bookingId, {
        include: [
          {
            association: "trip",
            include: [{ association: "driver" }],
          },
        ],
        lock: true,
        transaction: t,
      });

      if (booking.isCompleted()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.COMPLETE.ALREADY_COMPLETED,
          debugMessage: `Cannot complete booking '${bookingId}': already completed.`,
        });
      }

      if (!booking.isAwaitingFeedback()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.COMPLETE.NOT_AWAITING_FEEDBACK,
          debugMessage: `Cannot complete booking '${bookingId}': current status is '${booking.status}', expected 'awaiting_feedback'.`,
        });
      }

      const trip = booking.trip;
      const driver = trip?.driver;

      if (!trip || !driver) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `Missing relations for booking '${bookingId}': trip=${!!trip}, driver=${!!driver}.`,
        });
      }

      const seatsBooked = booking.seats_booked;
      const totalPrice = seatsBooked * trip.price;
      const platformFee = PLATFORM_FEE_PER_SEAT * seatsBooked;
      const driverEarnings = totalPrice - platformFee;

      await driver.addCredits(driverEarnings, { transaction: t });
      await booking.markAsCompleted({ transaction: t });

      return booking;
    });
  }

  /**
   * Reports an incident for a booking owned by a given user and marks it as completed.
   * The driver payment is suspended until the incident is resolved by a moderator.
   *
   * Incident creation and booking completion are not atomic. If completion fails, the incident is deleted manually.
   *
   * @param {User} user
   * @param {string} bookingId
   * @param {ReportBookingIncidentPayload} data
   * @returns {Promise<{ booking: Booking; incident: IncidentDocument }>} Updated booking and created incident.
   * @throws {AppError} 404 if booking does not exist or does not belong to the user.
   * @throws {AppError} 409 if booking is already completed.
   * @throws {AppError} 409 if booking is not in 'awaiting_feedback' status.
   * @throws {AppError} 404 if associated trip is not found (from IncidentService.create).
   * @throws {AppError} 409 if associated trip is not completed (from IncidentService.create).
   * @throws {AppError} 409 if user has already reported an incident for this trip (from IncidentService.create).
   * @throws {AppError} 500 if required trip relations (driver) are missing (from IncidentService.create).
   */
  public static async reportIncident(
    user: User,
    bookingId: string,
    data: ReportBookingIncidentPayload
  ): Promise<{ booking: Booking; incident: IncidentDocument }> {
    const booking = await sequelize.transaction(async (t) => {
      const b = await this.findOwnedById(user.id, bookingId, {
        include: [
          {
            association: "trip",
            include: [{ association: "driver" }],
          },
        ],
        lock: true,
        transaction: t,
      });

      if (b.isCompleted()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.REPORT_INCIDENT.ALREADY_COMPLETED,
          debugMessage: `Cannot report incident for booking '${bookingId}': already completed.`,
        });
      }

      if (!b.isAwaitingFeedback()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.REPORT_INCIDENT.NOT_AWAITING_FEEDBACK,
          debugMessage: `Cannot report incident for booking '${bookingId}': current status is '${b.status}', expected 'awaiting_feedback'.`,
        });
      }

      return b;
    });

    const { description } = data;

    const incident = await IncidentService.create(user, booking, description);

    try {
      await booking.markAsCompleted();
    } catch (err) {
      await Incident.deleteOne({ _id: incident._id });
      throw err;
    }

    return { booking, incident };
  }
}
