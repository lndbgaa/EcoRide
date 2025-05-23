import dayjs from "dayjs";
import { Op, Sequelize } from "sequelize";

import config from "@/config/app.config.js";
import { sequelize } from "@/config/mysql.config.js";
import { VEHICLE_ASSOCIATIONS } from "@/constants/index.js";
import { Booking, Preference, Ride, User, Vehicle } from "@/models/mysql/index.js";
import BookingService from "@/services/booking.service.js";
import EmailService from "@/services/email.service.js";
import PreferenceService from "@/services/preference.service.js";
import UserService from "@/services/user.service.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";

import type { FindOptions, WhereOptions } from "sequelize";

interface CreateRideData {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  vehicleId: string;
  price: number;
  offeredSeats: number;
}

interface SearchRidesData {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  isEcoFriendly?: boolean;
  maxDuration?: number;
  maxPrice?: number;
  minRating?: number;
}

interface RideDetails {
  ride: Ride;
  bookings: Booking[];
  preferences: string[];
}

const { clientUrl } = config;

class RideService {
  /**
   * Vérifie si un trajet existe et le retourne.
   * @param rideId - L'id du trajet.
   * @param options - Options sequelize
   * @returns Le trajet trouvé.
   */
  public static async findRideOrThrow(rideId: string, options?: FindOptions): Promise<Ride> {
    const ride: Ride | null = await Ride.findOne({
      where: { id: rideId },
      ...options,
    });

    if (!ride) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Aucun trajet trouvé avec l'id spécifié.",
      });
    }

    return ride;
  }

  /**
   * Vérifie que l'utilisateur est bien le chauffeur du trajet.
   * @param userId - L'id de l'utilisateur.
   * @param rideId - L'id du trajet.
   * @param options - Options sequelize
   * @returns Le trajet trouvé.
   */
  public static async findOwnedRideOrThrow(userId: string, rideId: string, options?: FindOptions): Promise<Ride> {
    const ride: Ride = await this.findRideOrThrow(rideId, options);

    if (ride.getDriverId() !== userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'avez pas les permissions pour accéder à ce trajet.",
      });
    }

    return ride;
  }

  /**
   * Crée un nouveau trajet.
   * @param userId - L'identifiant de l'utilisateur qui crée le trajet.
   * @param data - Les données du trajet.
   * @returns Le trajet créé.
   */
  public static async createRide(userId: string, data: CreateRideData): Promise<Ride> {
    const user: User = await UserService.assertUserIsDriverOrThrow(userId);
    const vehicle: Vehicle = await VehicleService.findVehicleById(data.vehicleId);

    const availablePassengerSeats = vehicle.getSeats() - 1;

    if (availablePassengerSeats < data.offeredSeats) {
      const message =
        availablePassengerSeats === 1
          ? `Le véhicule sélectionné ne peut accueillir qu'un seul passager`
          : `Le véhicule sélectionné ne peut accueillir que ${availablePassengerSeats} passagers`;

      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message,
      });
    }

    const formatDate = (date: string): Date => dayjs.tz(date, "Europe/Paris").utc().toDate();

    const dataToCreate: Partial<Ride> = {
      departure_location: data.departureLocation,
      departure_datetime: formatDate(data.departureDate + " " + data.departureTime),
      arrival_location: data.arrivalLocation,
      arrival_datetime: formatDate(data.arrivalDate + " " + data.arrivalTime),
      driver_id: user.getId(),
      vehicle_id: data.vehicleId,
      price: data.price,
      offered_seats: data.offeredSeats,
      is_eco_friendly: vehicle.isEcoVehicle(),
    };

    return await sequelize.transaction(async (transaction) => {
      const newRide: Ride = await Ride.create(dataToCreate, { transaction });

      const createdRide: Ride | null = await Ride.findOne({
        where: { id: newRide.getId() },
        include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
        transaction,
      });

      if (!createdRide) {
        throw new AppError({
          statusCode: 500,
          statusText: "Internal Server Error",
          message: "Une erreur est survenue lors de la création du trajet.",
        });
      }

      return createdRide;
    });
  }

  /**
   * Recherche des trajets.
   * @param data - Les données de la recherche.
   * @param limit
   * @param offset
   * @param userId - L'id de l'utilisateur connecté. (optionnel)
   * @returns Les trajets trouvés.
   */
  public static async searchForRides(
    data: SearchRidesData,
    limit: number,
    offset: number,
    userId?: string
  ): Promise<{ count: number; rides: Ride[] }> {
    const conditions: WhereOptions<Ride> = {
      departure_location: {
        [Op.like]: `${data.departureLocation}%`,
      },
      arrival_location: {
        [Op.like]: `${data.arrivalLocation}%`,
      },
      departure_datetime: {
        [Op.between]: [new Date(`${data.departureDate}T00:00:00`), new Date(`${data.departureDate}T23:59:59`)],
      },
      status: "open", // Affiche uniquement les trajets ouverts
    };

    // Si l'utilisateur est connecté, on ne retourne pas ses propres trajets
    if (userId) {
      conditions.driver_id = { [Op.ne]: userId };
    }

    if (data.isEcoFriendly === true) {
      conditions.is_eco_friendly = true;
    }

    if (data.maxPrice !== undefined) {
      conditions.price = { [Op.lte]: data.maxPrice };
    }

    if (data.maxDuration !== undefined) {
      conditions.duration = { [Op.lte]: data.maxDuration };
    }

    const { count, rows: rides }: { count: number; rows: Ride[] } = await Ride.findAndCountAll({
      where: conditions,
      limit,
      offset,
      order: [["departure_datetime", "ASC"]],
      distinct: true,
      include: [
        {
          association: "driver",
          required: !!data.minRating,
          where: data.minRating
            ? {
                average_rating: {
                  [Op.gte]: data.minRating,
                },
              }
            : undefined,
        },
      ],
    });

    return { count, rides };
  }

  /**
   * Récupère les détails d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les détails du trajet.
   */
  public static async getRideDetails(rideId: string): Promise<RideDetails> {
    const ride: Ride | null = await Ride.findOne({
      where: { id: rideId },
      include: [{ association: "driver" }, { association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
    });

    if (!ride) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Aucun trajet trouvé avec l'id spécifié.",
      });
    }

    const bookings: Booking[] = await BookingService.getRideBookings(ride.getId(), {
      where: { status: { [Op.in]: ["confirmed", "awaiting_feedback", "completed"] } },
      include: [{ association: "passenger" }],
    });

    const preferences: Preference[] = await PreferenceService.getPreferences(ride.getDriverId());

    const finalPreferences: string[] = preferences.flatMap((preference) => {
      if (preference.isCustom() && preference.getValue()) {
        return [preference.getLabel()];
      }

      if (preference.getLabel() === "Animaux") {
        return [preference.getValue() ? "J'accepte les animaux." : "Je n'accepte pas les animaux."];
      }

      if (preference.getLabel() === "Fumeurs") {
        return [preference.getValue() ? "J'accepte les fumeurs." : "Je n'accepte pas les fumeurs."];
      }

      return [];
    });

    return { ride, bookings, preferences: finalPreferences };
  }

  /**
   * Démarre un trajet.
   * @param rideId - L'identifiant du trajet à démarrer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async startRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride: Ride = await this.findOwnedRideOrThrow(userId, rideId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride.isOpen() && !ride.isFull()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible de démarrer ce trajet.",
        });
      }

      const now = dayjs().tz("Europe/Paris", true);
      const departure = dayjs.utc(ride.departure_datetime).tz("Europe/Paris", true);
      const diffInMs = departure.diff(now, "ms");
      const oneHourInMs = 60 * 60 * 1000;

      if (diffInMs > oneHourInMs) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Vous ne pouvez démarrer ce trajet que dans l'heure précédant l'heure de départ.",
        });
      }

      await ride.markAsInProgress({ transaction });
    });
  }

  /**
   * Termine un trajet.
   * @param rideId - L'identifiant du trajet à terminer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async endRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride: Ride = await this.findOwnedRideOrThrow(userId, rideId, {
        include: [{ association: "driver" }],
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride.isInProgress()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible de terminer ce trajet car il n'est pas en cours de progression.",
        });
      }

      await ride.markAsCompleted({ transaction });

      const bookings: Booking[] = await BookingService.getRideBookings(ride.getId(), {
        where: { status: "confirmed" },
        include: [{ association: "passenger" }],
      });

      if (bookings.length > 0) {
        await Promise.allSettled(bookings.map((booking) => booking.markAsAwaitingFeedback({ transaction })));

        await EmailService.sendBulkEmail(
          bookings.map((booking) => ({
            email: booking.getPassenger()?.getEmail() ?? "Inconnu",
            data: {
              passenger: booking.getPassenger()?.getFirstName() ?? "Inconnu",
              departureLocation: ride.departure_location,
              arrivalLocation: ride.arrival_location,
              driver: ride.driver?.getFirstName() ?? "Inconnu",
              rideId: ride.getId(),
              reviewUrl: `${clientUrl}/ride/${ride.getId()}/evaluate`,
            },
          })),
          "Valide ton trajet EcoRide",
          "rideReview.html"
        );
      }
    });
  }

  /**
   * Annule un trajet.
   * @param rideId - L'identifiant du trajet à annuler.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async cancelRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride: Ride = await this.findOwnedRideOrThrow(userId, rideId, {
        lock: transaction.LOCK.UPDATE,
        transaction,
        include: [{ association: "driver" }],
      });

      if (!ride.isOpen() && !ride.isFull()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible d'annuler ce trajet.",
        });
      }

      await ride.markAsCancelled({ transaction });

      const bookings: Booking[] = await BookingService.getRideBookings(ride.id, {
        where: { status: "confirmed" },
        include: [{ association: "passenger" }],
      });

      if (bookings.length > 0) {
        await Promise.allSettled(bookings.map((booking) => booking.markAsCancelled({ transaction })));

        await Promise.allSettled(
          bookings.map(async (booking) => {
            const passenger = booking.getPassenger();

            if (passenger) {
              passenger.addCredits(booking.getSeatsBooked() * ride.getPrice(), {
                transaction,
              });
            }
          })
        );

        await EmailService.sendBulkEmail(
          bookings.map((booking) => ({
            email: booking.getPassenger()?.getEmail() ?? "Inconnu",
            data: {
              passenger: booking.getPassenger()?.getFirstName() ?? "Inconnu",
              departureLocation: ride.departure_location,
              arrivalLocation: ride.arrival_location,
              departureDate: toDateOnly(ride.departure_datetime),
              departureTime: toTimeOnly(ride.departure_datetime),
              driver: ride.driver?.getFirstName() ?? "Inconnu",
              searchUrl: `${clientUrl}/search`,
            },
          })),
          "Ta réservation a été annulée",
          "rideCancellation.html"
        );
      }
    });
  }

  /**
   * Récupère les trajets (créés) d'un utilisateur.
   * @param userId - L'identifiant de l'utilisateur.
   * @returns Les trajets de l'utilisateur.
   */
  public static async getUserRides(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ count: number; rides: Ride[] }> {
    const { count, rows: rides }: { count: number; rows: Ride[] } = await Ride.findAndCountAll({
      where: { driver_id: userId },
      limit,
      offset,
      order: [
        [Sequelize.literal(`CASE WHEN status = 'open' THEN 0 ELSE 1 END`), "ASC"],
        ["departure_datetime", "ASC"],
      ],
    });

    return { count, rides };
  }
}

export default RideService;
