import { Op } from "sequelize";

import { appConfig, dayjs, sequelize } from "@/config";
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
import { Trip } from "@/models";
import { EmailService, VehicleService } from "@/services";
import { AppError, formatDateTimeFromUTC, parseDateTimeToUTC } from "@/utils";

import type { User } from "@/models";
import type {
  CreateTripData,
  CreateTripPayload,
  GetTripsFilters,
  GetTripsResponse,
  GetTripsSortOptions,
  SearchTripsPayload,
  TripDBFilter,
  TripSortField,
} from "@/types";
import type { FindOptions, Order, WhereOptions } from "sequelize";

const { clientUrl, gmail } = appConfig;

export class TripService {
  /**
   * Finds a trip by ID.
   *
   * @param {string} tripId - The ID of the trip to find.
   * @param {FindOptions} options - Additional Sequelize find options.
   * @returns {Promise<Trip>} The trip instance.
   * @throws {AppError} 404 if the trip is not found.
   */
  public static async findById(tripId: string, options?: FindOptions): Promise<Trip> {
    const trip = await Trip.findByPk(tripId, options);

    if (!trip) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `Trip '${tripId}' not found in database.`,
      });
    }

    return trip;
  }

  /**
   * Finds a trip by ID, ensuring it belongs to a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} tripId - The ID of the trip to find.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Trip>} The trip instance.
   * @throws {AppError} 404 if the trip does not exist or is not owned by the user.
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
        debugMessage: `Trip '${tripId}' not found or ownership check failed for user '${userId}.'`,
      });
    }

    return trip;
  }

  /**
   * Retrieves all trips with pagination, optional filters, and sorting.
   *
   * @param {number} limit - Maximum number of trips to return.
   * @param {number} offset - Number of trips to skip (for pagination).
   * @param {GetTripsFilters} [filters] - Optional filters:
   *  - status: single status or an array of statuses
   *  - driverId: filter trips by driver ID
   * @param {GetTripsSortOptions} [sortOptions] - Optional sort options:
   *  - by: 'createdAt' | 'departureDate' (default: 'createdAt')
   *  - dir: 'asc' | 'desc' (default: 'desc')
   * @param {Partial<FindOptions>} [options] - Additional Sequelize find options (include, attributes, etc.).
   * @returns {Promise<GetTripsResponse>} Object containing total count and list of trips.
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetTripsFilters,
    sortOptions?: GetTripsSortOptions,
    options?: Partial<FindOptions>
  ): Promise<GetTripsResponse> {
    const where: WhereOptions<TripDBFilter> = {};

    if (filters?.status) where.status = Array.isArray(filters.status) ? { [Op.in]: filters.status } : filters.status;
    if (filters?.driverId) where.driver_id = filters.driverId;

    const sortFieldMap: Record<TripSortField, string> = {
      createdAt: "created_at",
      departureDate: "departure_datetime",
    };

    const sortField = sortFieldMap[sortOptions?.by ?? "createdAt"] ?? "created_at";
    const sortDirection = sortOptions?.dir === "asc" ? "ASC" : "DESC";
    const order: Order = [[sortField, sortDirection]];

    const { count, rows } = await Trip.findAndCountAll({
      where,
      limit,
      offset,
      order,
      ...options,
      distinct: true,
    });

    return { count, trips: rows };
  }

  /**
   * Searches for trips based on given criteria.
   *
   * @param {SearchTripsPayload} data - The search parameters (from, to, date, seats, maxPrice, etc.).
   * @param {number} limit - Maximum number of trips to return.
   * @param {number} offset - Number of trips to skip (for pagination).
   * @param {User} [user] - The user performing the search. Trips where this user is the driver will be excluded.
   * @returns {Promise<GetTripsResponse>} Object containing total count of matching trips and an array of trip instances.
   */
  public static async search(data: SearchTripsPayload, limit: number, offset: number, user?: User): Promise<GetTripsResponse> {
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

    if (user?.id) conditions.driver_id = { [Op.ne]: user.id };
    if (data.seats) conditions.available_seats = { [Op.gte]: data.seats };
    if (data.maxPrice) conditions.price = { [Op.lte]: data.maxPrice };
    if (data.maxDuration) conditions.duration_minutes = { [Op.lte]: data.maxDuration };

    const { count, rows } = await Trip.findAndCountAll({
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

    return { count, trips: rows };
  }

  /**
   * Creates a new trip for a given user.
   *
   * @param {User} user - The user creating the trip.
   * @param {CreateTripPayload} data - The trip data (departureDate, departureLocation, ect.).
   * @returns {Promise<Trip>} Newly created trip with vehicle relation loaded.
   * @throws {AppError} 404 if vehicle is not found or is not owned by the user (from VehicleService.findOwnedByID()).
   * @throws {AppError} 400 if vehicle does not have enough passenger seats.
   */
  public static async create(user: User, data: CreateTripPayload): Promise<Trip> {
    const vehicle = await VehicleService.findOwnedById(user, data.vehicleId);

    const availablePassengerSeats = vehicle.seats - 1;

    if (availablePassengerSeats < data.offeredSeats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.CREATE.INSUFFICIENT_VEHICLE_SEATS,
        userMessageParams: { available: availablePassengerSeats },
        debugMessage: `Cannot create trip: Vehicle '${vehicle.id}' has ${availablePassengerSeats} passenger seat(s), ${data.offeredSeats} requested.`,
      });
    }

    const tripCreationData: CreateTripData = {
      departure_datetime: parseDateTimeToUTC(data.departureDate, data.departureTime),
      departure_location: data.departureLocation,
      arrival_datetime: parseDateTimeToUTC(data.arrivalDate, data.arrivalTime),
      arrival_location: data.arrivalLocation,
      driver_id: user.id,
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
   * Refunds are applied to passengers and emails are sent after transaction commit.
   *
   * @param {User} user - The owner of the trip.
   * @param {string} tripId - The ID of the trip to cancel.
   * @returns {Promise<Trip>} Updated trip with status set to 'cancelled'.
   * @throws {AppError} 404 if trip does not exist or is not owned by the user (from this.findOwnedById()).
   * @throws {AppError} 409 if trip status is not OPEN or FULL.
   * @throws {AppError} 409 if cancellation is attempted within minimum notice period with active bookings.
   */
  public static async cancel(user: User, tripId: string): Promise<Trip> {
    const trip = await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(user.id, tripId, {
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
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!(trip.isOpen() || trip.isFull())) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.CANCEL.INVALID_STATUS,
          debugMessage: `Cannot cancel trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesBeforeDeparture = departure.diff(now, "minute");

      if (minutesBeforeDeparture < TRIP_MIN_MINUTES_BEFORE_CANCELLATION && trip.bookings && trip.bookings.length > 0) {
        const hoursBeforeCancellation = TRIP_MIN_MINUTES_BEFORE_CANCELLATION / 60;

        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.CANCEL.TOO_CLOSE,
          userMessageParams: { hours: hoursBeforeCancellation },
          debugMessage: `Cannot cancel trip '${tripId}': too close to departure (${minutesBeforeDeparture} min remaining) with ${trip.bookings.length} active booking(s). Minimum required: ${TRIP_MIN_MINUTES_BEFORE_CANCELLATION} minutes.`,
        });
      }

      await trip.markAsCancelled({ transaction: t });

      if (trip.bookings?.length) {
        await Promise.all(
          trip.bookings.map(async (b) => {
            await b.markAsCancelled({ transaction: t });

            if (b.passenger) {
              const refundAmount = b.seats_booked * trip.price;
              await b.passenger.addCredits(refundAmount, { transaction: t });
            }
          })
        );
      }

      return trip;
    });

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

      await EmailService.sendBulkEmail(gmail.user, recipients, "Ta réservation a été annulée", "trip.cancelled.passenger.html");
      // TODO ajouter système de traduction pour email
    }

    return trip;
  }

  /**
   * Starts a trip owned by a given user.
   *
   * @param {User} user - The owner of the trip.
   * @param {string} tripId - The ID of the trip to start.
   * @returns {Promise<Trip>} Updated trip with status set to 'in_progress'.
   * @throws {AppError} 404 if trip does not exist or is not owned by the user (from this.findOwnedById()).
   * @throws {AppError} 409 if trip status is not OPEN or FULL.
   * @throws {AppError} 409 if start is attempted too early before departure.
   * @throws {AppError} 409 if start is attempted too late after departure.
   */
  public static async start(user: User, tripId: string): Promise<Trip> {
    return await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(user.id, tripId, {
        include: [{ association: "driver" }, { association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!(trip.isOpen() || trip.isFull())) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.START.INVALID_STATUS,
          debugMessage: `Cannot start trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      const now = dayjs.utc();
      const departure = dayjs.utc(trip.departure_datetime);
      const minutesUntilDeparture = departure.diff(now, "minute");

      if (minutesUntilDeparture > TRIP_MIN_MINUTES_BEFORE_STARTING) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.START.TOO_EARLY,
          userMessageParams: { minutes: TRIP_MIN_MINUTES_BEFORE_STARTING },
          debugMessage: `Cannot start trip '${tripId}': too early. Now is more than ${TRIP_MIN_MINUTES_BEFORE_STARTING} minutes before departure.`,
        });
      }

      if (minutesUntilDeparture < -TRIP_MAX_MINUTES_AFTER_STARTING) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.START.TOO_LATE,
          userMessageParams: { minutes: TRIP_MAX_MINUTES_AFTER_STARTING },
          debugMessage: `Cannot start trip '${tripId}': too late. Now is more than ${TRIP_MAX_MINUTES_AFTER_STARTING} minutes after departure.`,
        });
      }

      await trip.markAsInProgress({ transaction: t });

      return trip;
    });
  }

  /**
   * Ends a trip owned by a given user.
   *
   * Bookings are marked as awaiting feedback and review request emails are sent after transaction commit.
   *
   * @param {User} user - The owner of the trip.
   * @param {string} tripId - The ID of the trip to end.
   * @returns {Promise<Trip>} Updated trip with status set to 'completed'.
   * @throws {AppError} 404 if trip does not exist or is not owned by the user (from this.findOwnedById()).
   * @throws {AppError} 409 if trip status is not IN_PROGRESS.
   */
  public static async end(user: User, tripId: string): Promise<Trip> {
    const trip = await sequelize.transaction(async (t) => {
      const trip = await this.findOwnedById(user.id, tripId, {
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
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!trip.isInProgress()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: TRIP_ERROR_MESSAGES.END.INVALID_STATUS,
          debugMessage: `Cannot end trip '${tripId}': Current status is ${trip.status}.`,
        });
      }

      await trip.markAsCompleted({ transaction: t });

      if (trip.bookings?.length) {
        await Promise.all(
          trip.bookings.map(async (b) => {
            await b.markAsAwaitingFeedback({ transaction: t });
          })
        );
      }

      return trip;
    });

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

      await EmailService.sendBulkEmail(gmail.user, recipients, "Ton avis compte !", "trip.completed.passenger.html");
    }

    return trip;
  }
}
