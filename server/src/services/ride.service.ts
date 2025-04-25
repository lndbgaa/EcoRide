import type { RideStatus } from "@/types/index.js";

import { Ride, Vehicle } from "@/models/mysql";
import { VEHICLE_ASSOCIATIONS } from "@/models/mysql/Vehicle.model.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";
import { Op } from "sequelize";

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
   * @param userId - L'identifiant de l'utilisateur.
   * @param data - Les données du trajet.
   * @returns Le trajet créé.
   */
  public static async createRide(userId: string, data: CreateRideData): Promise<Ride> {
    const vehicle: Vehicle = await VehicleService.findOwnedVehicleOrThrow(userId, data.vehicleId);

    const availablePassengerSeats: number = vehicle.seats - 1;

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

    const newRide: Ride = await Ride.createOne(dataToCreate);

    const ride: Ride | null = await Ride.findOneByField("id", newRide.id, {
      include: [{ association: "vehicle", include: VEHICLE_ASSOCIATIONS }],
    });

    if (!ride) {
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message: "Une erreur est survenue lors de la création du trajet.",
      });
    }

    return ride;
  }

  /**
   * Recherche des trajets.
   * @param data - Les données de la recherche.
   * @returns Les trajets trouvés.
   */
  public static async searchForRides(userId: string, data: SearchRidesData): Promise<Ride[]> {
    const conditions: any = {
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
      driver_id: {
        [Op.ne]: userId, // ne propose pas ses propres trajets à l'utilisateur
      },
      status: "open", // ne retourne que les trajets ouverts et avec des places disponibles
    };

    if (data.isEcoFriendly !== undefined) {
      conditions.is_eco_friendly = data.isEcoFriendly; // filtre par véhicule éco-friendly
    }

    if (data.maxPrice) {
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

    return ride;
  }

  /**
   * Modifie le statut d'un trajet.
   * @param rideId - L'identifiant du trajet.
   * @param status - Le nouveau statut du trajet.
   */
  public static async changeRideStatus(rideId: string, status: RideStatus): Promise<void> {
    const ride: Ride = await this.findRideOrThrow(rideId);

    if (status === "in_progress") {
      await ride.markAsInProgress();
    } else if (status === "completed") {
      await ride.markAsCompleted();
    } else if (status === "no_show") {
      await ride.markAsNoShow();
    } else if (status === "cancelled") {
      await ride.markAsCancelled();
    }
  }
}

export default RideService;
