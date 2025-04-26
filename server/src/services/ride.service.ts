import { Op, type WhereOptions } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { Booking, Ride, User, Vehicle } from "@/models/mysql";
import { VEHICLE_ASSOCIATIONS } from "@/models/mysql/Vehicle.model.js";
import BookingService from "@/services/booking.service.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";

interface CreateRideData {
  departureDatetime: Date;
  departureLocation: string;
  arrivalDatetime: Date;
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

class RideService {
  public static async findRideOrThrow(rideId: string): Promise<Ride> {
    const ride: Ride | null = await Ride.findOneByField("id", rideId);

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
   * Crée un nouveau trajet.
   * @param userId - L'identifiant de l'utilisateur qui crée le trajet.
   * @param data - Les données du trajet.
   * @returns Le trajet créé.
   */
  public static async createRide(userId: string, data: CreateRideData): Promise<Ride> {
    const vehicle: Vehicle = await VehicleService.findOwnedVehicleOrThrow(userId, data.vehicleId);

    const availablePassengerSeats: number = vehicle.getSeats() - 1;

    if (availablePassengerSeats < data.offeredSeats) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message:
          "Le nombre de places proposées ne peut pas dépasser les places passagers du véhicule sélectionné.",
      });
    }

    const dataToCreate: Partial<Ride> = {
      departure_datetime: data.departureDatetime,
      departure_location: data.departureLocation,
      arrival_datetime: data.arrivalDatetime,
      arrival_location: data.arrivalLocation,
      driver_id: userId,
      vehicle_id: data.vehicleId,
      price: data.price,
      offered_seats: data.offeredSeats,
      is_eco_friendly: vehicle.isEcoVehicle(),
    };

    return await sequelize.transaction(async (transaction) => {
      const newRide: Ride = await Ride.createOne(dataToCreate, { transaction });

      const createdRide: Ride | null = await Ride.findOneByField("id", newRide.id, {
        transaction,
        include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
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
   * @param userId - L'id de l'utilisateur connecté. (optionnel)
   * @returns Les trajets trouvés.
   */
  public static async searchForRides(data: SearchRidesData, userId?: string): Promise<Ride[]> {
    const conditions: WhereOptions<Ride> = {
      departure_location: {
        [Op.like]: `%${data.departureLocation}%`, // recherche par ville de départ
      },
      arrival_location: {
        [Op.like]: `%${data.arrivalLocation}%`, // recherche par ville d'arrivée
      },
      departure_datetime: {
        [Op.between]: [
          new Date(`${data.departureDate}T00:00:00`),
          new Date(`${data.departureDate}T23:59:59`),
        ], // recherche par date de départ
      },
      status: "open", // ne retourne que les trajets ouverts et avec des places disponibles
    };

    if (userId) {
      conditions.driver_id = { [Op.ne]: userId }; // ne propose pas ses propres trajets à l'utilisateur connecté
    }

    if (data.isEcoFriendly === true) {
      conditions.is_eco_friendly = true; // filtre par véhicule éco-friendly
    }

    if (data.maxPrice !== undefined) {
      conditions.price = { [Op.lte]: data.maxPrice }; // filtre par prix maximum
    }

    if (data.maxDuration !== undefined) {
      conditions.duration = { [Op.lte]: data.maxDuration }; // filtre par durée maximum
    }

    const rides: Ride[] = await Ride.findAll({
      where: conditions,
      order: [["departure_datetime", "ASC"]], // tri par date de départ croissante
      include: [
        {
          association: "driver",
          where: data.minRating
            ? {
                average_rating: {
                  [Op.gte]: data.minRating, // filtre par note minimale du conducteur
                },
              }
            : undefined,
        },
        { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
      ],
    });

    return rides;
  }

  /**
   * Récupère les détails d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les détails du trajet.
   */
  public static async getRideDetails(rideId: string): Promise<Ride> {
    const ride: Ride | null = await Ride.findOneByField("id", rideId, {
      include: [
        { association: "driver" },
        { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
      ],
    });

    if (!ride) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Aucun trajet trouvé avec l'id spécifié.",
      });
    }

    const bookings: Booking[] = await BookingService.getRideBookings(ride.id);
    const passengers: User[] = bookings
      .map((booking) => booking.getPassenger())
      .filter((passenger): passenger is User => passenger !== null);

    ride.setPassengers(passengers);

    return ride;
  }

  /**
   * Démarre un trajet.
   * @param rideId - L'identifiant du trajet à démarrer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async startRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride: Ride | null = await Ride.findOneByField("id", rideId, {
        where: { driver_id: userId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride) {
        throw new AppError({
          statusCode: 404,
          statusText: "Not Found",
          message: "Aucun trajet trouvé ou vous n'avez pas les permissions pour le démarrer.",
        });
      }

      if (!ride.isOpen() && !ride.isFull()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible de démarrer ce trajet car il n'est plus disponible.",
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
      const ride: Ride | null = await Ride.findOneByField("id", rideId, {
        where: { driver_id: userId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride) {
        throw new AppError({
          statusCode: 404,
          statusText: "Not Found",
          message: "Aucun trajet trouvé ou vous n'avez pas les permissions pour le terminer.",
        });
      }

      if (!ride.isInProgress()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible de terminer ce trajet car il n'est pas en cours.",
        });
      }

      await ride.markAsCompleted({ transaction });

      const bookings: Booking[] = await BookingService.getRideBookings(ride.id);

      if (bookings.length > 0) {
        await Promise.allSettled(
          bookings.map((booking) => booking.markAsCompleted({ transaction }))
        );
      }

      // TODO : logger les erreurs de changement de statut des réservations
    });
  }

  /**
   * Annule un trajet.
   * @param rideId - L'identifiant du trajet à annuler.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async cancelRide(rideId: string, userId: string): Promise<void> {
    return await sequelize.transaction(async (transaction) => {
      const ride: Ride | null = await Ride.findOneByField("id", rideId, {
        where: { driver_id: userId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride) {
        throw new AppError({
          statusCode: 404,
          statusText: "Not Found",
          message: "Aucun trajet trouvé ou vous n'avez pas les permissions pour l'annuler.",
        });
      }

      if (!ride.isOpen() && !ride.isFull()) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible d'annuler ce trajet.",
        });
      }

      await ride.markAsCancelled({ transaction });

      const bookings: Booking[] = await BookingService.getRideBookings(ride.id);

      if (bookings.length > 0) {
        await Promise.allSettled(
          bookings.map((booking) => booking.markAsCancelled({ transaction }))
        );
      }

      // TODO : logger les erreurs de changement de statut des réservations
    });
  }

  /**
   * Récupère les trajets d'un utilisateur.
   * @param userId - L'identifiant de l'utilisateur.
   * @returns Les trajets de l'utilisateur.
   */
  public static async getUserRides(userId: string): Promise<Ride[]> {
    const rides: Ride[] = await Ride.findAllByField("driver_id", userId, {
      include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
    });

    return rides;
  }
}

export default RideService;
