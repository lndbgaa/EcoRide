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

import type { CreateBookingPayload, IncidentDocument, ReportBookingIncidentPayload } from "@/types";
import type { FindOptions } from "sequelize";

export class BookingService {
  /**
   * Finds a booking by ID, ensuring it belongs to a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} bookingId - The ID of the booking.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Booking>} - The returned booking instance.
   * @throws {AppError} - If:
   *   - The booking does not exist, or
   *   - The booking exists but does not belong to the user (HTTP 404).
   */
  public static async findOwnedById(
    userId: string,
    bookingId: string,
    options?: FindOptions
  ): Promise<Booking> {
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
   * Creates a booking for a given user.
   *
   * @param {User} user - The user (passenger) making the booking.
   * @param {CreateBookingPayload} data - The booking data containing tripId and seatsToBook.
   * @returns {Promise<Booking>} - The newly created booking instance with trip relation loaded.
   * @throws {AppError} - If:
   *   - The trip is not found (HTTP 404, thrown by TripService.findById).
   *   - The user is the driver of the trip (HTTP 409).
   *   - The trip is not open for bookings (HTTP 409).
   *   - There are not enough available seats (HTTP 409).
   *   - The user has insufficient credits (HTTP 402).
   *   - The user already has an active booking for this trip (HTTP 409).
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
          debugMessage: `[BookingService.create] Cannot create booking: User '${user.id}' is the driver of trip '${tripId}'.`,
        });
      }

      if (!trip.isOpen()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.TRIP_NOT_OPEN,
          debugMessage: `[BookingService.create] Cannot create booking: Trip '${tripId}' is not open for bookings (current status: ${trip.status}).`,
        });
      }

      if (trip.available_seats < seatsToBook) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.NOT_ENOUGH_SEATS,
          userMessageParams: { available: trip.available_seats },
          debugMessage: `[BookingService.create] Cannot create booking: Trip '${tripId}' has ${trip.available_seats} seat(s) available, ${seatsToBook} requested.`,
        });
      }

      const tripPrice = trip.price;
      const totalPrice = tripPrice * seatsToBook;

      if (user.credits < totalPrice) {
        throw new AppError({
          statusCode: 402,
          userMessageKey: BOOKING_ERROR_MESSAGES.CREATE.INSUFFICIENT_CREDITS,
          userMessageParams: { required: totalPrice },
          debugMessage: `[BookingService.create] Cannot create booking: User '${user.id}' has ${user.credits} credit(s), ${totalPrice} required.`,
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
          debugMessage: `[BookingService.create] Cannot create booking: User '${user.id}' already has an active booking for trip '${tripId}'.`,
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
   * @param {User} user - The user (passenger) requesting the cancellation.
   * @param {string} bookingId - The ID of the booking to cancel.
   * @returns {Promise<Booking>} - The updated booking instance with status set to cancelled.
   * @throws {AppError} - If:
   *   - The booking is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The booking is already cancelled (HTTP 409).
   *   - The booking is not in a confirmed state (HTTP 409)
   *   - Required relations (trip or passenger) are missing (HTTP 500).
   */
  public static async cancel(user: User, bookingId: string): Promise<Booking> {
    return await sequelize.transaction(async (t) => {
      const booking = await this.findOwnedById(user.id, bookingId, {
        include: [{ association: "trip" }, { association: "passenger" }],
        lock: true,
        transaction: t,
      });

      if (booking.isCancelled()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.ALREADY_CANCELLED,
          debugMessage: `[BookingService.cancel] Cannot cancel booking '${bookingId}': already cancelled.`,
        });
      }

      if (!booking.isConfirmed()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.INVALID_STATUS,
          debugMessage: `[BookingService.cancel] Cannot cancel booking '${bookingId}': current status is ${booking.status}.`,
        });
      }

      const { trip, passenger } = booking;

      if (!trip || !passenger) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `[BookingService.cancel] Missing relations for booking '${bookingId}': trip=${!!trip}, passenger=${!!passenger}.`,
        });
      }

      // Prevent cancellation if too close to departure
      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesBeforeDeparture = departure.diff(now, "minute");

      if (minutesBeforeDeparture < BOOKING_MIN_MINUTES_BEFORE_CANCELLATION) {
        const hoursBeforeCancellation = BOOKING_MIN_MINUTES_BEFORE_CANCELLATION / 60;

        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.CANCEL.TOO_CLOSE,
          userMessageParams: { hours: hoursBeforeCancellation },
          debugMessage: `[BookingService.cancel] Cannot cancel booking '${bookingId}': too close to departure (${minutesBeforeDeparture} min remaining). Minimum required: ${BOOKING_MIN_MINUTES_BEFORE_CANCELLATION} minutes.`,
        });
      }

      const seatsBooked = booking.seats_booked;
      const refund = trip.price * seatsBooked;

      await booking.markAsCancelled({ transaction: t });
      await trip.addAvailableSeats(seatsBooked, { transaction: t });
      await passenger.addCredits(refund, { transaction: t });

      return booking;
    });
  }

  /**
   * Completes a booking owned by a given user and credits the driver.
   *
   * This method finalizes a booking after the trip has ended and the passenger
   * has provided feedback. The driver receives the trip earnings minus platform fees.
   *
   * @param {User} user - The user (passenger) completing the booking.
   * @param {string} bookingId - The ID of the booking to complete.
   * @returns {Promise<Booking>} - The updated booking instance with status set to completed.
   * @throws {AppError} - If:
   *   - The booking is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The booking is already completed (HTTP 409).
   *   - The booking is not in 'awaiting_feedback' status (HTTP 409).
   *   - Required relations (trip or driver) are missing (HTTP 500).
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
          debugMessage: `[BookingService.complete] Cannot complete booking '${bookingId}': already completed.`,
        });
      }

      if (!booking.isAwaitingFeedback()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.COMPLETE.NOT_AWAITING_FEEDBACK,
          debugMessage: `[BookingService.complete] Cannot complete booking '${bookingId}': current status is '${booking.status}', expected 'awaiting_feedback'.`,
        });
      }

      const trip = booking.trip;
      const driver = trip?.driver;

      if (!trip || !driver) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `[BookingService.complete] Missing relations for booking '${bookingId}': trip=${!!trip}, driver=${!!driver}.`,
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
   * Note: The incident creation and booking completion are not atomic.
   * If marking the booking as completed fails, the incident is manually deleted.
   *
   * @param {User} user - The user (passenger) reporting the incident.
   * @param {string} bookingId - The ID of the booking.
   * @param {ReportBookingIncidentPayload} data - The incident data containing the description.
   * @returns {Promise<{ booking: Booking; incident: IncidentDocument }>} - The updated booking and created incident.
   * @throws {AppError} - If:
   *   - The booking is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The booking is already completed (HTTP 409).
   *   - The booking is not in 'awaiting_feedback' status (HTTP 409).
   *   - The associated trip is not found (HTTP 404, thrown by IncidentService.create).
   *   - The associated trip is not completed (HTTP 409, thrown by IncidentService.create).
   *   - The user has already reported an incident for this trip (HTTP 409, thrown by IncidentService.create).
   *   - Required relations (driver) are missing (HTTP 500, thrown by IncidentService.create).
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
          debugMessage: `[BookingService.reportIncident] Cannot report incident for booking '${bookingId}': already completed.`,
        });
      }

      if (!b.isAwaitingFeedback()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: BOOKING_ERROR_MESSAGES.REPORT_INCIDENT.NOT_AWAITING_FEEDBACK,
          debugMessage: `[BookingService.reportIncident] Cannot report incident for booking '${bookingId}': current status is '${b.status}', expected 'awaiting_feedback'.`,
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
