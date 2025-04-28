import { Op, type FindOptions, type WhereOptions } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { Ride, User } from "@/models/mysql";
import { VEHICLE_ASSOCIATIONS } from "@/models/mysql/Vehicle.model.js";
import BookingService from "@/services/booking.service.js";
import EmailService from "@/services/email.service.js";
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
  /**
   * Vérifie si un trajet existe et le retourne.
   * @param rideId - L'id du trajet.
   * @param options - Options sequelize
   * @returns Le trajet trouvé.
   */
  public static async findRideOrThrow(rideId: string, options?: FindOptions): Promise<Ride> {
    const ride = await Ride.findOneByField("id", rideId, options);

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
    try {
      const vehicle = await VehicleService.findOwnedVehicleOrThrow(userId, data.vehicleId);

      const availablePassengerSeats = vehicle.getSeats() - 1;

      if (availablePassengerSeats < data.offeredSeats) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: `Le nombre de places proposées (${data.offeredSeats}) dépasse les places passagers disponibles (${availablePassengerSeats}) du véhicule sélectionné.`,
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
        const newRide = await Ride.createOne(dataToCreate, { transaction });

        const createdRide = await Ride.findOneByField("id", newRide.id, {
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
    } catch (error) {
      console.error("Erreur lors de la création du trajet", error);
      throw error;
    }
  }

  /**
   * Recherche des trajets.
   * @param data - Les données de la recherche.
   * @param userId - L'id de l'utilisateur connecté. (optionnel)
   * @returns Les trajets trouvés.
   */
  public static async searchForRides(data: SearchRidesData, userId?: string): Promise<Ride[]> {
    try {
      const conditions: WhereOptions<Ride> = {
        departure_location: {
          [Op.like]: `%${data.departureLocation}%`,
        },
        arrival_location: {
          [Op.like]: `%${data.arrivalLocation}%`,
        },
        departure_datetime: {
          [Op.between]: [
            new Date(`${data.departureDate}T00:00:00`),
            new Date(`${data.departureDate}T23:59:59`),
          ],
        },
        status: "open",
      };

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

      const rides = await Ride.findAll({
        where: conditions,
        order: [["departure_datetime", "ASC"]],
        include: [
          { association: "vehicle", include: VEHICLE_ASSOCIATIONS },
          {
            association: "driver",
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

      return rides;
    } catch (error) {
      console.error("Erreur lors de la recherche de trajets", error);
      throw error;
    }
  }

  /**
   * Récupère les passagers d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les passagers du trajet.
   */
  public static async getRidePassengers(rideId: string): Promise<User[]> {
    try {
      const ride = await this.findRideOrThrow(rideId);
      const bookings = await BookingService.getRideBookings(ride.id, {
        where: { status: "confirmed" },
      });

      const passengers = bookings
        .map((booking) => booking.getPassenger())
        .filter((passenger): passenger is User => passenger !== null);

      return passengers;
    } catch (error) {
      console.error("Erreur lors de la récupération des passagers du trajet", error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @returns Les détails du trajet.
   */
  public static async getRideDetails(rideId: string): Promise<Ride> {
    try {
      const ride = await Ride.findOneByField("id", rideId, {
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

      const passengers: User[] = await this.getRidePassengers(ride.id);

      ride.setPassengers(passengers);

      return ride;
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du trajet", error);
      throw error;
    }
  }

  /**
   * Démarre un trajet.
   * @param rideId - L'identifiant du trajet à démarrer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async startRide(rideId: string, userId: string): Promise<void> {
    try {
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

        await ride.markAsInProgress({ transaction });
      });
    } catch (error) {
      console.error("Erreur lors du démarrage du trajet", error);
      throw error;
    }
  }

  /**
   * Termine un trajet.
   * @param rideId - L'identifiant du trajet à terminer.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async endRide(rideId: string, userId: string): Promise<void> {
    try {
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

        const bookings = await BookingService.getRideBookings(ride.id);

        if (bookings.length > 0) {
          const passengers = await this.getRidePassengers(ride.id);

          await Promise.allSettled(
            bookings.map((booking) => booking.markAsCompleted({ transaction }))
          );

          await Promise.allSettled(
            passengers.map(async (passenger: User) => {
              const recipient: string = passenger.getEmail();
              const subject: string = "Évaluez votre trajet Ecoride";
              const content: string = await EmailService.renderTemplate("rideReview.html", {
                passenger: passenger.getFirstName(),
                departureLocation: ride.departure_location,
                arrivalLocation: ride.arrival_location,
                departureDatetime: ride.departure_datetime.toLocaleString(),
                driver: ride.driver?.getFirstName() ?? "Inconnu",
              });

              await EmailService.sendEmail(recipient, subject, content);
            })
          );
        }

        // TODO : logger les erreurs "silencieuses"
      });
    } catch (error) {
      console.error("Erreur lors de la terminaison du trajet", error);
      throw error;
    }
  }

  /**
   * Annule un trajet.
   * @param rideId - L'identifiant du trajet à annuler.
   * @param userId - L'identifiant de l'utilisateur.
   */
  public static async cancelRide(rideId: string, userId: string): Promise<void> {
    try {
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
            passengers.map(async (passenger: User) => {
              const recipient = passenger.getEmail();
              const subject = "Réservation annulée";
              const content = await EmailService.renderTemplate("rideCancellation.html", {
                passenger: passenger.getFirstName(),
                departureLocation: ride.departure_location,
                arrivalLocation: ride.arrival_location,
                departureDatetime: ride.departure_datetime.toLocaleString(),
                driver: ride.driver?.getFirstName() ?? "Inconnu",
              });

              await EmailService.sendEmail(recipient, subject, content);
            })
          );
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du trajet", error);
      throw error;
    }
  }

  /**
   * Récupère les trajets d'un utilisateur.
   * @param userId - L'identifiant de l'utilisateur.
   * @returns Les trajets de l'utilisateur.
   */
  public static async getUserRides(userId: string): Promise<Ride[]> {
    try {
      const rides = await Ride.findAllByField("driver_id", userId, {
        include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
      });

      return rides;
    } catch (error) {
      console.error("Erreur lors de la récupération des trajets de l'utilisateur", error);
      throw error;
    }
  }
}

export default RideService;
