import dayjs from "dayjs";
import { Op } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { VEHICLE_ASSOCIATIONS } from "@/constants/index.js";
import { Ride, User } from "@/models/mysql";
import BookingService from "@/services/booking.service.js";
import EmailService from "@/services/email.service.js";
import PreferenceService from "@/services/preference.service.js";
import UserService from "@/services/user.service.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";

import type { FindOptions, WhereOptions } from "sequelize";

interface CreateRideData {
  departureDatetime: string;
  departureLocation: string;
  arrivalDatetime: string;
  arrivalLocation: string;
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
  passengers: User[];
  preferences: string[];
}

class RideService {
  /**
   * Vérifie si un trajet existe et le retourne.
   * @param rideId - L'id du trajet.
   * @param options - Options sequelize
   * @returns Le trajet trouvé.
   */
  public static async findRideOrThrow(rideId: string, options?: FindOptions): Promise<Ride> {
    const ride = await Ride.findOne({
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
  public static async findOwnedRideOrThrow(
    userId: string,
    rideId: string,
    options?: FindOptions
  ): Promise<Ride> {
    const ride = await this.findRideOrThrow(rideId, options);

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
    const user = await UserService.assertUserIsDriverOrThrow(userId);
    const vehicle = await VehicleService.findOwnedVehicleOrThrow(user.getId(), data.vehicleId);

    const availablePassengerSeats = vehicle.getSeats() - 1;

    if (availablePassengerSeats < data.offeredSeats) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Vous proposez ${data.offeredSeats} places, mais le véhicule sélectionné ne peut accueillir que ${availablePassengerSeats} passagers.`,
      });
    }

    const formatDate = (date: string): Date => dayjs.tz(date, "Europe/Paris").utc().toDate();

    const dataToCreate: Partial<Ride> = {
      departure_datetime: formatDate(data.departureDatetime),
      departure_location: data.departureLocation,
      arrival_datetime: formatDate(data.arrivalDatetime),
      arrival_location: data.arrivalLocation,
      driver_id: user.getId(),
      vehicle_id: data.vehicleId,
      price: data.price,
      offered_seats: data.offeredSeats,
      is_eco_friendly: vehicle.isEcoVehicle(),
    };

    return await sequelize.transaction(async (transaction) => {
      const newRide = await Ride.create(dataToCreate, { transaction });

      const createdRide = await Ride.findOne({
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
        [Op.between]: [
          new Date(`${data.departureDate}T00:00:00`),
          new Date(`${data.departureDate}T23:59:59`),
        ],
      },
      status: "open", // Sélectionne uniquement les trajets ouverts
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

    const { count, rows: rides } = await Ride.findAndCountAll({
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
   * Récupère les passagers d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les passagers du trajet.
   */
  public static async getRidePassengers(rideId: string): Promise<User[]> {
    const ride = await this.findRideOrThrow(rideId);
    const bookings = await BookingService.getRideBookings(ride.getId(), {
      where: { status: "confirmed" },
    });

    const passengers = bookings
      .map((booking) => booking.getPassenger())
      .filter((passenger): passenger is User => passenger !== null);

    return passengers;
  }

  /**
   * Récupère les détails d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les détails du trajet.
   */
  public static async getRideDetails(rideId: string): Promise<RideDetails> {
    const ride = await Ride.findOne({
      where: { id: rideId },
      include: [
        { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
        { association: "driver" },
      ],
    });

    if (!ride) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Aucun trajet trouvé avec l'id spécifié.",
      });
    }

    const passengers: User[] = await this.getRidePassengers(ride.getId());

    const preferences = await PreferenceService.getPreferences(ride.getDriverId());

    const finalPreferences: string[] = preferences.flatMap((preference) => {
      if (preference.isCustom() && preference.getValue()) {
        return [preference.getLabel()];
      }

      if (preference.getLabel() === "Animaux") {
        return [preference.getValue() ? "J'accepte les animaux." : "Je n'accepte pas les animaux."];
      }

      if (preference.getLabel() === "Fumeur") {
        return [preference.getValue() ? "J'accepte les fumeurs." : "Je n'accepte pas les fumeurs."];
      }

      return [];
    });

    return { ride, passengers, preferences: finalPreferences };
  }

  /**
   * Démarre un trajet.
   * @param rideId - L'identifiant du trajet à démarrer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async startRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride = await this.findOwnedRideOrThrow(userId, rideId, {
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
          message:
            "Vous ne pouvez démarrer ce trajet que dans l'heure précédant l'heure de départ.",
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
      const ride = await this.findOwnedRideOrThrow(userId, rideId, {
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

      const bookings = await BookingService.getRideBookings(ride.getId(), {
        where: { status: "confirmed" },
      });

      if (bookings.length > 0) {
        const passengers = await this.getRidePassengers(ride.getId());

        await Promise.allSettled(
          bookings.map((booking) => booking.markAsAwaitingFeedback({ transaction }))
        );

        await EmailService.sendBulkEmail(
          passengers.map((passenger) => ({
            email: passenger.getEmail(),
            data: {
              passenger: passenger.getFirstName(),
              departureLocation: ride.departure_location,
              arrivalLocation: ride.arrival_location,
              driver: ride.driver?.getFirstName() ?? "Inconnu",
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
      const ride = await this.findOwnedRideOrThrow(userId, rideId, {
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

      const bookings = await BookingService.getRideBookings(ride.id);

      if (bookings.length > 0) {
        const passengers = await this.getRidePassengers(ride.id);

        await Promise.allSettled(
          bookings.map((booking) => booking.markAsCancelled({ transaction }))
        );

        await Promise.allSettled(
          passengers.map(async (passenger) => {
            const booking = bookings.find(
              (booking) => booking.getPassengerId() === passenger.getId()
            );

            if (booking) {
              passenger.addCredits(booking.getSeatsBooked() * ride.getPrice(), {
                transaction,
              });
            }
          })
        );

        await EmailService.sendBulkEmail(
          passengers.map((passenger) => ({
            email: passenger.getEmail(),
            data: {
              passenger: passenger.getFirstName(),
              departureLocation: ride.departure_location,
              arrivalLocation: ride.arrival_location,
              departureDate: toDateOnly(ride.departure_datetime),
              departureTime: toTimeOnly(ride.departure_datetime),
              driver: ride.driver?.getFirstName() ?? "Inconnu",
            },
          })),
          "Ta réservation a été annulée",
          "rideCancellation.html"
        );
      }
    });
  }

  /**
   * Récupère les trajets d'un utilisateur.
   * @param userId - L'identifiant de l'utilisateur.
   * @returns Les trajets de l'utilisateur.
   */
  public static async getUserRides(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ count: number; rides: Ride[] }> {
    const { count, rows: rides } = await Ride.findAndCountAll({
      where: { driver_id: userId },
      limit,
      offset,
      order: [["departure_datetime", "ASC"]],
    });

    return { count, rides };
  }
}

export default RideService;
