import { sequelize } from "@/config/mysql.config.js";
import { User, Vehicle } from "@/models/mysql";
import { VEHICLE_ASSOCIATIONS } from "@/models/mysql/Vehicle.model.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

export type CreateVehicleData = {
  brandId: number;
  model: string;
  colorId: number;
  energyId: number;
  seats: number;
  licensePlate: string;
  firstRegistration: Date;
};

export type UpdateVehicleData = {
  brandId?: number;
  model?: string;
  colorId?: number;
  energyId?: number;
  seats?: number;
};

class VehicleService {
  /**
   * Récupère un véhicule par son id
   * @param vehicleId - L'id du véhicule
   * @returns Le véhicule trouvé
   */
  public static async findVehicleOrThrow(vehicleId: string): Promise<Vehicle> {
    const vehicle: Vehicle | null = await Vehicle.findOneByField("id", vehicleId);

    if (!vehicle) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Véhicule non trouvé. Veuillez vérifier l'id du véhicule.",
      });
    }

    return vehicle;
  }

  /**
   * Vérifie si un véhicule appartient bien à un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param vehicleId - L'id du véhicule
   * @returns Le véhicule trouvé
   */
  public static async findOwnedVehicleOrThrow(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle: Vehicle = await this.findVehicleOrThrow(vehicleId);

    if (vehicle.getOwnerId() !== userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'êtes pas le propriétaire de ce véhicule.",
      });
    }

    return vehicle;
  }

  /**
   * Récupère tous les véhicules d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les véhicules de l'utilisateur
   */
  public static async getUserVehicles(userId: string): Promise<Vehicle[]> {
    const vehicles = await Vehicle.findAllByField("owner_id", userId, {
      include: VEHICLE_ASSOCIATIONS,
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

    const doesLicensePlateExist: boolean =
      (await Vehicle.findOneByField("license_plate", data.licensePlate)) !== null;

    if (doesLicensePlateExist) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un véhicule avec cette plaque d'immatriculation existe déjà.",
      });
    }

    const dataToCreate: Partial<Vehicle> = {
      brand_id: data.brandId,
      model: data.model,
      color_id: data.colorId,
      energy_id: data.energyId,
      seats: data.seats,
      license_plate: data.licensePlate,
      owner_id: userId,
      first_registration: data.firstRegistration,
    };

    return await sequelize.transaction(async (transaction) => {
      const newVehicle: Vehicle = await Vehicle.createOne(dataToCreate, { transaction });

      const createdVehicle: Vehicle | null = await Vehicle.findOneByField("id", newVehicle.id, {
        transaction,
        include: VEHICLE_ASSOCIATIONS,
      });

      if (!createdVehicle) {
        throw new AppError({
          statusCode: 500,
          statusText: "Internal Server Error",
          message: "Une erreur est survenue lors de la création du véhicule.",
        });
      }

      return createdVehicle;
    });
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
  ): Promise<Vehicle> {
    const user: User = await UserService.assertUserIsDriverOrThrow(userId);

    const vehicle: Vehicle = await this.findOwnedVehicleOrThrow(user.id, vehicleId);

    const dataToUpdate: Partial<Vehicle> = {
      brand_id: data.brandId,
      model: data.model,
      color_id: data.colorId,
      energy_id: data.energyId,
      seats: data.seats,
    };

    return await sequelize.transaction(async (transaction) => {
      await Vehicle.updateByField("id", vehicle.id, dataToUpdate, { transaction });

      const updatedVehicle: Vehicle | null = await Vehicle.findOneByField("id", vehicle.id, {
        transaction,
        include: VEHICLE_ASSOCIATIONS,
      });

      if (!updatedVehicle) {
        throw new AppError({
          statusCode: 500,
          statusText: "Internal Server Error",
          message: "Une erreur est survenue lors de la mise à jour du véhicule.",
        });
      }

      return updatedVehicle;
    });
  }

  /**
   * Supprime un véhicule pour un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param vehicleId - L'id du véhicule à supprimer
   */
  public static async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    const user: User = await UserService.findUserOrThrow(userId);

    const vehicle: Vehicle = await this.findOwnedVehicleOrThrow(user.id, vehicleId);

    await vehicle.destroy();
  }
}

export default VehicleService;
