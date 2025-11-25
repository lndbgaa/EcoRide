import dayjs from "dayjs";
import { Op } from "sequelize";

import { sequelize } from "@/config";
import { COMMON_ERROR_MESSAGES, RIDE_STATUSES, VEHICLE_ASSOCIATIONS } from "@/constants";
import { VEHICLE_ERROR_MESSAGES } from "@/constants/errors";
import { Ride, Vehicle, VehicleBrand, VehicleColor, VehicleEnergy } from "@/models/mysql";
import { UserService } from "@/services";
import { AppError } from "@/utils";

import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleCreationAttributes,
} from "@/types";
import type { FindOptions } from "sequelize";

export class VehicleService {
  /**
   * Retrieves all vehicles owned by a given user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Vehicle[]>} - A list of the user's vehicles.
   * @throws {AppError} - If:
   *   - The user does not exist (HTTP 500, thrown by UserService.findById).
   */
  public static async getUserVehicles(userId: string): Promise<Vehicle[]> {
    await UserService.findById(userId, 500);

    const vehicles = await Vehicle.findAll({
      where: { owner_id: userId },
      include: VEHICLE_ASSOCIATIONS,
    });

    return vehicles;
  }

  /**
   * Finds a vehicle by ID, ensuring it belongs to the given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} vehicleId - The ID of the vehicle.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Vehicle>} - The returned vehicle instance.
   * @throws {AppError} - If:
   *   - The vehicle is not found or the ownership check fails (HTTP 404).
   */
  public static async findOwnedVehicleById(
    userId: string,
    vehicleId: string,
    options?: FindOptions
  ): Promise<Vehicle> {
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        owner_id: userId,
      },
      include: VEHICLE_ASSOCIATIONS,
      ...options,
    });

    if (!vehicle) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[VehicleService.findOwnedVehicleById] Vehicle with ID ${vehicleId} not found or ownership check failed for user ${userId}`,
      });
    }

    return vehicle;
  }

  /**
   * Creates a new vehicle for a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {CreateVehiclePayload} data - The data for the new vehicle.
   * @returns {Promise<Vehicle>} - The newly created vehicle instance.
   * @throws {AppError} - If:
   *   - The user does not exist (HTTP 500, thrown by UserService.findById).
   *   - The license plate is already registered by another vehicle (HTTP 409).
   *   - Provided brandId, colorId, or energyId is invalid (HTTP 400).
   */
  public static async createVehicle(userId: string, data: CreateVehiclePayload): Promise<Vehicle> {
    await UserService.findById(userId, 500);

    return sequelize.transaction(async (t) => {
      const licensePlateExists = !!(await Vehicle.findOne({
        attributes: ["id"],
        where: { license_plate: data.licensePlate },
        transaction: t,
      }));

      if (licensePlateExists) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: VEHICLE_ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
        });
      }

      const [brand, color, energy] = await Promise.all([
        VehicleBrand.findByPk(data.brandId, { transaction: t }),
        VehicleColor.findByPk(data.colorId, { transaction: t }),
        VehicleEnergy.findByPk(data.energyId, { transaction: t }),
      ]);

      if (!brand)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.BRAND_INVALID,
        });
      if (!color)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.COLOR_INVALID,
        });
      if (!energy)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.ENERGY_INVALID,
        });

      const vehicleAttributes: VehicleCreationAttributes = {
        brand_id: data.brandId,
        model: data.model,
        color_id: data.colorId,
        energy_id: data.energyId,
        seats: data.seats,
        license_plate: data.licensePlate,
        owner_id: userId,
        first_registration_date: dayjs(data.firstRegistrationDate).toDate(),
      };

      const vehicle = await Vehicle.create(vehicleAttributes, { transaction: t });
      await vehicle.reload({ include: VEHICLE_ASSOCIATIONS, transaction: t });

      return vehicle;
    });
  }

  /**
   * Updates the information of an existing vehicle.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} vehicleId - The ID of the vehicle.
   * @param {UpdateVehiclePayload} data - The new data for the vehicle.
   * @returns {Promise<Vehicle>} - The updated vehicle instance.
   * @throws {AppError} - If:
   *   - The vehicle is not found or the ownership check fails (HTTP 404, thrown by findOwnedVehicleById).
   *   - Provided brandId, colorId, or energyId is invalid (HTTP 400, thrown by vehicle.updateInfo).
   *   - No changes were detected in the provided data (HTTP 400, thrown by vehicle.updateInfo)
   */
  public static async updateVehicle(
    userId: string,
    vehicleId: string,
    data: UpdateVehiclePayload
  ): Promise<Vehicle> {
    return await sequelize.transaction(async (t) => {
      const vehicle = await this.findOwnedVehicleById(userId, vehicleId, { transaction: t });

      const updatedVehicle = await vehicle.updateInfo(data, { transaction: t });

      await updatedVehicle.reload({
        include: VEHICLE_ASSOCIATIONS,
        transaction: t,
      });

      return updatedVehicle;
    });
  }

  /**
   * Deletes a specific vehicle owned by the specified user.
   *
   * @param {string} userId - The ID of the user.
   * @param {string} vehicleId - The ID of the vehicle.
   *  @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The vehicle is not found or the ownership check fails (HTTP 404, thrown by findOwnedVehicleById).
   *   - The vehicle has active rides associated with it (HTTP 409).
   */
  public static async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    return await sequelize.transaction(async (t) => {
      const vehicle = await this.findOwnedVehicleById(userId, vehicleId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const activeRide = await Ride.findOne({
        where: {
          vehicle_id: vehicle.id,
          status: {
            [Op.notIn]: [RIDE_STATUSES.CANCELLED, RIDE_STATUSES.COMPLETED],
          },
        },
        attributes: ["id"],
        limit: 1,
        transaction: t,
      });

      if (activeRide) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: VEHICLE_ERROR_MESSAGES.VEHICLE_CANNOT_BE_DELETED,
        });
      }

      await vehicle.markAsDeleted({ transaction: t });
    });
  }
}
