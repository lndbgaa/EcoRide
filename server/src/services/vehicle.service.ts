import type { CreateVehicleData, UpdateVehicleData } from "@/types/vehicle.types.js";

import { Vehicle } from "@/models/mysql/index.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

class VehicleService {
  public static async findOwnedVehicleOrThrow(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = await Vehicle.findOneByField("id", vehicleId);

    if (!vehicle) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Véhicule non trouvé. Veuillez vérifier l'id du véhicule.",
      });
    }

    if (vehicle.owner_id !== userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'avez pas les permissions pour accéder à ce véhicule.",
      });
    }

    return vehicle;
  }

  /**
   * Récupère tous les véhicules d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les véhicules de l'utilisateur
   */
  public static async getVehicles(userId: string): Promise<Vehicle[]> {
    const vehicles = await Vehicle.findAllByField("owner_id", userId, {
      include: [{ association: "brand" }, { association: "color" }, { association: "energy" }],
    });

    return vehicles;
  }

  /**
   * Crée un nouveau véhicule pour un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param data - Les données du véhicule à créer
   * @returns Le véhicule créé
   */
  public static async createVehicle(userId: string, data: CreateVehicleData): Promise<Vehicle> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const doesLicensePlateExist =
      (await Vehicle.findOneByField("license_plate", data.license_plate)) !== null;

    if (doesLicensePlateExist) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un véhicule avec cette plaque d'immatriculation existe déjà.",
      });
    }

    const newVehicle = await Vehicle.createOne({ ...data, owner_id: userId });

    return newVehicle;
  }

  /**
   * Met à jour un véhicule pour un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param vehicleId - L'id du véhicule à mettre à jour
   * @param data - Les données du véhicule à mettre à jour
   * @returns Le véhicule mis à jour
   */
  public static async updateVehicle(
    userId: string,
    vehicleId: string,
    data: UpdateVehicleData
  ): Promise<void> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const vehicle = await this.findOwnedVehicleOrThrow(userId, vehicleId);

    await vehicle.update(data);
  }

  /**
   * Supprime un véhicule pour un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param vehicleId - L'id du véhicule à supprimer
   */
  public static async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const vehicle = await this.findOwnedVehicleOrThrow(userId, vehicleId);

    await vehicle.destroy();
  }
}

export default VehicleService;
