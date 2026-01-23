import { Op } from "sequelize";

import { dayjs, sequelize } from "@/config";
import { COMMON_ERROR_MESSAGES, TRIP_STATUSES, VEHICLE_ASSOCIATIONS, VEHICLE_ERROR_MESSAGES } from "@/constants";
import { Trip, Vehicle, VehicleBrand, VehicleColor, VehicleEnergy } from "@/models";
import { AppError } from "@/utils";

import type { User } from "@/models";
import type { CreateVehicleData, CreateVehiclePayload, UpdateVehiclePayload } from "@/types";
import type { FindOptions } from "sequelize";

export class VehicleService {
  /**
   * Retrieves all vehicles owned by a given user.
   *
   * @param {User} user
   * @returns {Promise<Vehicle[]>}
   */
  public static async getUserVehicles(user: User): Promise<Vehicle[]> {
    const vehicles = await Vehicle.findAll({
      where: { owner_id: user.id },
      include: VEHICLE_ASSOCIATIONS,
    });

    return vehicles;
  }

  /**
   * Finds a vehicle by ID, ensuring it belongs to a given user.
   *
   * @param {User} user
   * @param {string} vehicleId
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Vehicle>}
   * @throws {AppError} 404 if vehicle does not exist, or vehicle exists but does not belong to user.
   */
  public static async findOwnedById(user: User, vehicleId: string, options?: FindOptions): Promise<Vehicle> {
    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId, owner_id: user.id },
      include: VEHICLE_ASSOCIATIONS,
      ...options,
    });

    if (!vehicle) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `Vehicle '${vehicleId}' not found or ownership check failed for user '${user.id}'.`,
      });
    }

    return vehicle;
  }

  /**
   * Creates a new vehicle for a given user.
   *
   * @param {User} user
   * @param {CreateVehiclePayload} data
   * @returns {Promise<Vehicle>}
   * @throws {AppError} 409 if license plate is already registered by another vehicle.
   * @throws {AppError} 400 if provided brandId, colorId, or energyId is invalid.
   */
  public static async create(user: User, data: CreateVehiclePayload): Promise<Vehicle> {
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

      const vehicleCreationData: CreateVehicleData = {
        brand_id: data.brandId,
        model: data.model,
        color_id: data.colorId,
        energy_id: data.energyId,
        seats: data.seats,
        license_plate: data.licensePlate,
        owner_id: user.id,
        first_registration_date: dayjs(data.firstRegistrationDate).toDate(),
      };

      const vehicle = await Vehicle.create(vehicleCreationData, { transaction: t });
      await vehicle.reload({ include: VEHICLE_ASSOCIATIONS, transaction: t });

      return vehicle;
    });
  }

  /**
   * Updates the information of an existing vehicle.
   *
   * @param {User} user
   * @param {string} vehicleId
   * @param {UpdateVehiclePayload} data
   * @returns {Promise<Vehicle>}
   * @throws {AppError} 404 if vehicle is not found or the ownership check fails (from this.findOwnedById()).
   * @throws {AppError} 400 if no changes were detected in the provided data (from vehicle.updateInfo).
   * @throws {AppError} 400 if provided brandId, colorId, or energyId is invalid (from vehicle.updateInfo).
   */
  public static async updateVehicle(user: User, vehicleId: string, data: UpdateVehiclePayload): Promise<Vehicle> {
    return await sequelize.transaction(async (t) => {
      const vehicle = await this.findOwnedById(user, vehicleId, { transaction: t });

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
   * @param {User} user
   * @param {string} vehicleId
   *  @returns {Promise<void>}
   * @throws {AppError} 404 if vehicle is not found or the ownership check fails (from this.findOwnedById()).
   * @throws {AppError} 409 if vehicle has active trips associated with it.
   */
  public static async deleteVehicle(user: User, vehicleId: string): Promise<void> {
    return await sequelize.transaction(async (t) => {
      const vehicle = await this.findOwnedById(user, vehicleId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const activeTrip = await Trip.findOne({
        where: {
          vehicle_id: vehicle.id,
          status: {
            [Op.notIn]: [TRIP_STATUSES.CANCELLED, TRIP_STATUSES.COMPLETED],
          },
        },
        attributes: ["id"],
        limit: 1,
        transaction: t,
      });

      if (activeTrip) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: VEHICLE_ERROR_MESSAGES.VEHICLE_CANNOT_BE_DELETED,
        });
      }

      await vehicle.markAsDeleted({ transaction: t });
    });
  }
}
