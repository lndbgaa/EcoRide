import dayjs from "dayjs";

import { sequelize } from "@/config/mysql.config.js";
import { VEHICLE_ASSOCIATIONS } from "@/constants/index.js";
import { Vehicle, VehicleBrand, VehicleColor, VehicleEnergy } from "@/models/mysql";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

export type CreateVehicleData = {
  brandId: number;
  model: string;
  colorId: number;
  energyId: number;
  seats: number;
  licensePlate: string;
  firstRegistration: string;
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
  public static async findVehicleById(vehicleId: string): Promise<Vehicle> {
    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId },
      include: VEHICLE_ASSOCIATIONS,
    });

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
  public static async findOwnedVehicleById(userId: string, vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.findVehicleById(vehicleId);

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
    const vehicles = await Vehicle.findAll({
      where: { owner_id: userId },
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

    const doesLicensePlateExist: boolean = !!(await Vehicle.findOne({
      attributes: ["id"],
      where: { license_plate: data.licensePlate },
    }));

    if (doesLicensePlateExist) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un véhicule avec cette plaque d'immatriculation existe déjà.",
      });
    }

    const parsedDate = dayjs(data.firstRegistration, "DD/MM/YYYY", true);

    if (!parsedDate.isValid()) {
      throw new AppError({
        statusCode: 400,
        message: "La date de première mise en circulation est invalide.",
      });
    }

    const formattedDate = parsedDate.format("YYYY-MM-DD");

    const dataToCreate: Partial<Vehicle> = {
      brand_id: data.brandId,
      model: data.model,
      color_id: data.colorId,
      energy_id: data.energyId,
      seats: data.seats,
      license_plate: data.licensePlate,
      owner_id: userId,
      first_registration: new Date(formattedDate),
    };

    return await sequelize.transaction(async (transaction) => {
      const newVehicle: Vehicle = await Vehicle.create(dataToCreate, {
        transaction,
      });

      const createdVehicle = await Vehicle.findOne({
        where: { id: newVehicle.id },
        include: VEHICLE_ASSOCIATIONS,
        transaction,
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
  public static async updateVehicle(userId: string, vehicleId: string, data: UpdateVehicleData): Promise<Vehicle> {
    const user = await UserService.assertUserIsDriverOrThrow(userId);
    const vehicle = await this.findOwnedVehicleById(user.id, vehicleId);

    const dataToUpdate: Partial<Vehicle> = {
      brand_id: data.brandId,
      model: data.model,
      color_id: data.colorId,
      energy_id: data.energyId,
      seats: data.seats,
    };

    return await sequelize.transaction(async (transaction) => {
      await Vehicle.update(dataToUpdate, {
        where: { id: vehicle.id },
        transaction,
      });

      const updatedVehicle = await Vehicle.findOne({
        where: { id: vehicle.id },
        include: VEHICLE_ASSOCIATIONS,
        transaction,
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
    const user = await UserService.findUserOrThrow(userId);
    const vehicle = await this.findOwnedVehicleById(user.id, vehicleId);

    await vehicle.destroy();
  }

  /**
   * Récupère toutes les marques de véhicules
   * @returns Les marques de véhicules
   */
  public static async getVehicleBrands(): Promise<VehicleBrand[]> {
    return await VehicleBrand.findAll();
  }

  /**
   * Récupère toutes les couleurs de véhicules
   * @returns Les couleurs de véhicules
   */
  public static async getVehicleColors(): Promise<VehicleColor[]> {
    return await VehicleColor.findAll();
  }

  /**
   * Récupère toutes les énergies de véhicules
   * @returns Les énergies de véhicules
   */
  public static async getVehicleEnergies(): Promise<VehicleEnergy[]> {
    return await VehicleEnergy.findAll();
  }
}

export default VehicleService;
