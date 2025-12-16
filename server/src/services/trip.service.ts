import { Op } from "sequelize";

import {
  BOOKING_STATUSES,
  COMMON_ERROR_MESSAGES,
  TRIP_ERROR_MESSAGES,
  TRIP_MAX_MINUTES_AFTER_STARTING,
  TRIP_MIN_MINUTES_BEFORE_CANCELLATION,
  TRIP_MIN_MINUTES_BEFORE_STARTING,
  TRIP_STATUSES,
  VEHICLE_ASSOCIATIONS,
  VEHICLE_ECO_ENERGY_KEYS,
} from "@/constants";

import { appConfig, dayjs, sequelize } from "@/config";
import { Trip } from "@/models/mysql";
import { EmailService, VehicleService } from "@/services";
import { AppError, formatDateTimeFromUTC, parseDateTimeToUTC } from "@/utils";

import type { CreateTripData, CreateTripPayload, SearchTripsPayload, SearchTripsResponse } from "@/types";
import type { FindOptions, WhereOptions } from "sequelize";

const { clientUrl, gmail } = appConfig;

export class TripService {
  /**
   * Finds a trip by ID.
   *
   * @param {string} tripId -  The ID of the trip.
   * @param {FindOptions} options - Additional Sequelize find options.
   * @returns {Promise<Trip>} - The returned trip instance.
   * @throws {AppError} - If:
   *   - The trip is not found (HTTP 404).
   */
  public static async findById(tripId: string, options?: FindOptions): Promise<Trip> {
    const trip = await Trip.findByPk(tripId, options);

    if (!trip) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[TripService.findById] Trip '${tripId}' not found in database.`,
      });
    }

    return trip;
  }

  /**
   * Finds a trip by ID, ensuring it belongs to a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} tripId - The ID of the trip.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Trip>} - The returned trip instance.
   * @throws {AppError} - If:
   *   - The trip does not exist, or
   *   - The trip exists but does not belong to the user (HTTP 404).
   */
  public static async findOwnedById(userId: string, tripId: string, options?: FindOptions): Promise<Trip> {
    const trip = await Trip.findOne({
      where: { id: tripId, driver_id: userId },
      ...options,
    });

    if (!trip) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[TripService.findOwnedById] Trip '${tripId}' not found or ownership check failed for user '${userId}.'`,
      });
    }

    return trip;
  }

  /**
   * Searches for trips based on given criteria.
   *
   * @param {SearchTripsPayload} data - The search parameters.
   * @param {number} limit - Maximum number of trips to return.
   * @param {number} offset - Number of trips to skip (for pagination).
   * @param {string} [userId] - ID of the user performing the search. Trips where this user is the driver will be excluded.
   * @returns {SearchTripsResponse} - Object containing the total count of matching trips and an array of trip instances.
   */
  public static async search(
    data: SearchTripsPayload,
    limit: number,
    offset: number,
    userId?: string
  ): Promise<SearchTripsResponse> {
    const dateParis = dayjs.tz(data.date, "Europe/Paris");

    let startUtc = dateParis.startOf("day").utc().toDate();
    const endUtc = dateParis.endOf("day").utc().toDate();

    if (dayjs().tz("Europe/Paris").isSame(dateParis, "day")) {
      startUtc = dayjs.utc().toDate();
    }

    const conditions: WhereOptions<Trip> = {
      departure_location: { [Op.like]: `${data.from}%` },
      arrival_location: { [Op.like]: `${data.to}%` },
      departure_datetime: { [Op.between]: [startUtc, endUtc] },
      status: TRIP_STATUSES.OPEN,
    };

    if (userId) conditions.driver_id = { [Op.ne]: userId };
    if (data.seats) conditions.available_seats = { [Op.gte]: data.seats };
    if (data.maxPrice) conditions.price = { [Op.lte]: data.maxPrice };
    if (data.maxDuration) conditions.duration_minutes = { [Op.lte]: data.maxDuration };

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: conditions,
      limit,
      offset,
      order: [["departure_datetime", "ASC"]],
      distinct: true,
      include: [
        {
          association: "driver",
          required: true,
          where: data.minRating ? { average_rating: { [Op.gte]: data.minRating } } : undefined,
        },
        {
          association: "vehicle",
          required: true,
          include: [
            {
              association: "energy",
              required: true,
              where: data.ecoFriendly ? { key: { [Op.in]: VEHICLE_ECO_ENERGY_KEYS } } : undefined,
            },
          ],
        },
      ],
    });

    return { count, trips };
  }

  /**
   * Creates a new trip for a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {CreateTripPayload} data - The data for the new trip.
   * @returns {Promise<Trip>} - The newly created trip instance.
   * @throws {AppError} - If:
   *   - The vehicle is not found or the ownership check fails (HTTP 404, thrown by VehicleService.findOwnedById).
   *   - The vehicle does not have enough passenger seats (HTTP 400).
   */
  public static async create(userId: string, data: CreateTripPayload): Promise<Trip> {
    const vehicle = await VehicleService.findOwnedById(userId, data.vehicleId);

    const availablePassengerSeats = vehicle.seats - 1;

    if (availablePassengerSeats < data.offeredSeats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.CREATE.INSUFFICIENT_VEHICLE_SEATS,
        userMessageParams: { available: availablePassengerSeats },
        debugMessage: `[TripService.create] Cannot create trip: Vehicle '${vehicle.id}' has ${availablePassengerSeats} passenger seat(s), ${data.offeredSeats} requested.`,
      });
    }

    const tripCreationData: CreateTripData = {
      departure_datetime: parseDateTimeToUTC(data.departureDate, data.departureTime),
      departure_location: data.departureLocation,
      arrival_datetime: parseDateTimeToUTC(data.arrivalDate, data.arrivalTime),
      arrival_location: data.arrivalLocation,
      driver_id: userId,
      vehicle_id: data.vehicleId,
      price: data.price,
      offered_seats: data.offeredSeats,
    };

    return await sequelize.transaction(async (t) => {
      const trip = await Trip.create(tripCreationData, { transaction: t });

      await trip.reload({
        include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
        transaction: t,
      });

      return trip;
    });
  }

  /**
   * Cancels a trip owned by a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} tripId - The ID of the trip.
   * @returns {Promise<Trip>} - The updated trip instance.
   * @throws {AppError} - If:
   *   - The trip is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The trip status is not OPEN or FULL (HTTP 409).
   *   - Cancellation is attempted within minimum notice period with active bookings (HTTP 403).
   */
  public static async cancel(userId: string, tripId: string): Promise<Trip> {
    const trip = await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(userId, tripId, {
        include: [
          { association: "driver" },
          { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
          {
            association: "bookings",
            include: [{ association: "passenger" }],
            where: { status: { [Op.ne]: BOOKING_STATUSES.CANCELLED } },
            required: false,
          },
        ],
        lock: true,
        transaction: t,
      });

      // Validate trip status
      const isCancellable = trip.isOpen() || trip.isFull();
      if (!isCancellable) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.CANCEL.INVALID_STATUS,
          debugMessage: `[TripService.cancel] Cannot cancel trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      // Prevent cancellation if too close to departure with active bookings
      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesBeforeDeparture = departure.diff(now, "minute");

      if (
        minutesBeforeDeparture < TRIP_MIN_MINUTES_BEFORE_CANCELLATION &&
        trip.bookings &&
        trip.bookings.length > 0
      ) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: TRIP_ERROR_MESSAGES.CANCEL.TOO_CLOSE,
          debugMessage: `[TripService.cancel] Cannot cancel trip '${tripId}': too close to departure (${minutesBeforeDeparture} min remaining) with ${trip.bookings.length} active booking(s). Minimum required: ${TRIP_MIN_MINUTES_BEFORE_CANCELLATION} minutes.`,
        });
      }

      await trip.markAsCancelled({ transaction: t });

      // Refund all passengers
      if (trip.bookings?.length) {
        await Promise.all(
          trip.bookings.map(async (b) => {
            await b.markAsCancelled({ transaction: t });

            const passenger = b.passenger;
            const refundAmount = b.seats_booked * trip.price;

            if (passenger) {
              await passenger.addCredits(refundAmount, { transaction: t });
            }
          })
        );
      }

      return trip;
    });

    // Notify affected passengers via email
    if (trip.bookings?.length) {
      const departure = formatDateTimeFromUTC(trip.departure_datetime);

      const recipients = trip.bookings
        .filter((b) => b.passenger?.email)
        .map((b) => ({
          email: b.passenger!.email,
          data: {
            passenger: b.passenger!.first_name,
            driver: trip.driver!.first_name,
            departureLocation: trip.departure_location,
            arrivalLocation: trip.arrival_location,
            departureDate: dayjs(departure.date).format("DD/MM/YYYY"),
            departureTime: departure.time,
            refunded: b.seats_booked * trip.price,
            searchUrl: `${clientUrl}/search`,
          },
        }));

      await EmailService.sendBulkEmail(
        gmail.user,
        recipients,
        "Ta réservation a été annulée",
        "trip.cancelled.passenger.html"
      );
    }

    return trip;
  }

  /**
   * Starts a trip owned by a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} tripId - The ID of the trip.
   * @returns {Promise<Trip>} - The updated trip instance.
   * @throws {AppError} - If:
   *   - The trip is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The trip status is not OPEN or FULL (HTTP 409).
   *   - The start is attempted too early before departure (HTTP 403).
   *   - The start is attempted too late after departure (HTTP 403).
   */
  public static async start(userId: string, tripId: string): Promise<Trip> {
    return await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(userId, tripId, {
        include: [{ association: "driver" }, { association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
        lock: true,
        transaction: t,
      });

      // Validate trip status
      const canBeStarted = trip.isOpen() || trip.isFull();
      if (!canBeStarted) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.START.INVALID_STATUS,
          debugMessage: `[TripService.start] Cannot start trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesUntilDeparture = departure.diff(now, "minute");

      // Too early to start
      if (minutesUntilDeparture > TRIP_MIN_MINUTES_BEFORE_STARTING) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: TRIP_ERROR_MESSAGES.START.TOO_EARLY,
          debugMessage: `[TripService.start] Cannot start trip '${tripId}': too early. Now is more than ${TRIP_MIN_MINUTES_BEFORE_STARTING} minutes before departure.`,
        });
      }

      // Too late to start
      if (minutesUntilDeparture < -TRIP_MAX_MINUTES_AFTER_STARTING) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: TRIP_ERROR_MESSAGES.START.TOO_LATE,
          debugMessage: `[TripService.start] Cannot start trip '${tripId}': too late. Now is more than ${TRIP_MAX_MINUTES_AFTER_STARTING} minutes after departure.`,
        });
      }

      await trip.markAsInProgress({ transaction: t });

      return trip;
    });
  }

  /**
   * Ends a trip owned by a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} tripId - The ID of the trip.
   * @returns {Promise<Trip>} - The updated trip instance.
   * @throws {AppError} - If:
   *   - The trip is not found or doesn't belong to the user (HTTP 404, thrown by this.findOwnedById).
   *   - The trip status is not IN_PROGRESS (HTTP 409).
   */
  public static async end(userId: string, tripId: string): Promise<Trip> {
    const trip = await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(userId, tripId, {
        include: [
          { association: "driver" },
          { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
          {
            association: "bookings",
            include: [{ association: "passenger" }],
            where: { status: { [Op.ne]: BOOKING_STATUSES.CANCELLED } },
            required: false,
          },
        ],
        lock: true,
        transaction: t,
      });

      // Validate trip status
      const canBeEnded = trip.isInProgress();
      if (!canBeEnded) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.END.INVALID_STATUS,
          debugMessage: `[TripService.end] Cannot end trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      await trip.markAsCompleted({ transaction: t });

      // Mark all bookings as awaiting feedback
      if (trip.bookings?.length) {
        await Promise.all(
          trip.bookings.map(async (b) => {
            await b.markAsAwaitingFeedback({ transaction: t });
          })
        );
      }

      return trip;
    });

    // Send review requests to all passengers
    if (trip.bookings?.length) {
      const recipients = trip.bookings
        .filter((b) => b.passenger?.email)
        .map((b) => ({
          email: b.passenger!.email,
          data: {
            passenger: b.passenger!.first_name,
            driver: trip.driver!.first_name,
            departureLocation: trip.departure_location,
            arrivalLocation: trip.arrival_location,
            reviewUrl: `${clientUrl}/trips/${trip.id}/evaluate`,
          },
        }));

      await EmailService.sendBulkEmail(
        gmail.user,
        recipients,
        "Ton avis compte !",
        "trip.completed.passenger.html"
      );
    }

    return trip;
  }
}
