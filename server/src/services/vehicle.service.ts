import { Vehicle } from "@/models/mysql";
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

    const doesLicensePlateExist =
      (await Vehicle.findOneByField("license_plate", data.licensePlate)) !== null;

    if (doesLicensePlateExist) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un véhicule avec cette plaque d'immatriculation existe déjà.",
      });
    }

    const dataToCreate = {
      brand_id: data.brandId,
      model: data.model,
      color_id: data.colorId,
      energy_id: data.energyId,
      seats: data.seats,
      license_plate: data.licensePlate,
      owner_id: userId,
      first_registration: data.firstRegistration,
    };

    const newVehicle = await Vehicle.createOne(dataToCreate);

    const vehicle = await Vehicle.findOneByField("id", newVehicle.id, {
      include: VEHICLE_ASSOCIATIONS,
    });

    if (!vehicle) {
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message: "Une erreur est survenue lors de la création du véhicule.",
      });
    }

    return vehicle;
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
    await UserService.assertUserIsDriverOrThrow(userId); // vérifie que l'utilisateur est chauffeur

    await this.findOwnedVehicleOrThrow(userId, vehicleId); // vérifie que le véhicule appartient à l'utilisateur

    await Vehicle.updateByField("id", vehicleId, data); // met à jour le véhicule

    const updatedVehicle = await Vehicle.findOneByField("id", vehicleId, {
      include: VEHICLE_ASSOCIATIONS,
    }); // récupère le véhicule mis à jour avec les associations

    if (!updatedVehicle) {
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message: "Une erreur est survenue lors de la mise à jour du véhicule.",
      });
    }

    return updatedVehicle;
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
