import dayjs from "dayjs";
import { DataTypes, Model, Op } from "sequelize";

import {
  COMMON_ERROR_MESSAGES,
  VEHICLE_ECO_ENERGY_KEYS,
  VEHICLE_ERROR_MESSAGES,
  VEHICLE_MAX_SEATS,
  VEHICLE_MIN_SEATS,
} from "@/constants";
import { VehicleBrand, VehicleColor, VehicleEnergy } from "@/models/mysql";
import { AppError, formatDateOnly, setIfChanged } from "@/utils";

import type { User } from "@/models/mysql";
import type { UpdateVehiclePayload, VehicleAdminDTO, VehiclePrivateDTO, VehiclePublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { SaveOptions, Sequelize } from "sequelize";

export default class Vehicle extends Model {
  declare id: string;
  declare brand_id: number;
  declare model: string;
  declare color_id: number;
  declare energy_id: number;
  declare seats: number;
  declare license_plate: string;
  declare first_registration_date: Date;
  declare owner_id: string;
  declare deleted_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  declare brand?: VehicleBrand;
  declare color?: VehicleColor;
  declare energy?: VehicleEnergy;
  declare owner?: User;

  // ----------------------------
  // Getters
  // ----------------------------

  public get isEco(): boolean {
    return VEHICLE_ECO_ENERGY_KEYS.includes(this.energy?.key ?? "");
  }

  public get isDeleted(): boolean {
    return this.deleted_at !== null;
  }

  // ------------------------------------
  // Business Logic
  // ------------------------------------

  /**
   * Marks the current vehicle instance as deleted (soft delete).
   * Sets `deleted_at` and appends a timestamp to `license_plate` to free it.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<void>}
   */
  public async markAsDeleted(options?: SaveOptions): Promise<void> {
    if (this.deleted_at) return;

    const now = dayjs();
    const nowDate = now.toDate();
    const nowTimestamp = now.valueOf();

    this.deleted_at = nowDate;
    this.license_plate = `${this.license_plate}-DELETED-${nowTimestamp}`;

    await this.save({ ...options, fields: ["deleted_at", "license_plate"] });
  }

  /**
   * Updates the information of the current vehicle instance.
   * Only saves fields that have actually changed based on the provided data.
   *
   * @param {UpdateVehiclePayload} data - The object containing the new vehicle information.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<Vehicle>} - The updated vehicle instance.
   * @throws {AppError} - If:
   *   - No changes were detected between the current instance and the provided data (HTTP 400).
   *   - Provided brandId, colorId, or energyId is invalid (HTTP 400).
   */
  public async updateInfo(data: UpdateVehiclePayload, options?: SaveOptions): Promise<Vehicle> {
    const updatedFields: string[] = [];

    if (data.brandId) {
      const brand = await VehicleBrand.findByPk(data.brandId);
      if (!brand)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.BRAND_INVALID,
        });
      if (setIfChanged(this, "brand_id", data.brandId, false)) updatedFields.push("brand_id");
    }

    if (data.colorId) {
      const color = await VehicleColor.findByPk(data.colorId);
      if (!color)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.COLOR_INVALID,
        });
      if (setIfChanged(this, "color_id", data.colorId, false)) updatedFields.push("color_id");
    }

    if (data.energyId) {
      const energy = await VehicleEnergy.findByPk(data.energyId);
      if (!energy)
        throw new AppError({
          statusCode: 400,
          userMessageKey: VEHICLE_ERROR_MESSAGES.ENERGY_INVALID,
        });
      if (setIfChanged(this, "energy_id", data.energyId, false)) updatedFields.push("energy_id");
    }

    if (setIfChanged(this, "model", data.model, false)) updatedFields.push("model");
    if (setIfChanged(this, "first_registration_date", data.firstRegistrationDate, false))
      updatedFields.push("first_registration_date");

    if (updatedFields.length === 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: COMMON_ERROR_MESSAGES.NO_CHANGES_DETECTED,
      });
    }

    return await this.save({ ...options, fields: updatedFields });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(t: TFunction): VehiclePublicDTO {
    return {
      id: this.id,
      brand: this.brand?.toDTO(t).display ?? null,
      model: this.model,
      color: this.color?.toDTO(t).display ?? null,
      energy: this.energy?.toDTO(t).display ?? null,
      seats: this.seats,
      isEco: this.isEco,
    };
  }

  public toPrivateDTO(t: TFunction): VehiclePrivateDTO {
    return {
      ...this.toPublicDTO(t),
      licensePlate: this.license_plate,
      firstRegistrationDate: formatDateOnly(this.first_registration_date),
    };
  }

  public toAdminDTO(t: TFunction): VehicleAdminDTO {
    return {
      ...this.toPrivateDTO(t),
      owner: this.owner?.toPublicDTO() ?? null,
    };
  }

  // ----------------------------
  // Model Init
  // ----------------------------

  public static initModel(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        brand_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "vehicle_brands", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        model: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: { notEmpty: { msg: "Model is required" } },
        },
        color_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "vehicle_colors", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        energy_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "vehicle_energies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        seats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [VEHICLE_MIN_SEATS],
              msg: `Vehicle must have at least ${VEHICLE_MIN_SEATS} seats`,
            },
            max: {
              args: [VEHICLE_MAX_SEATS],
              msg: `Vehicle cannot have more than ${VEHICLE_MAX_SEATS} seats`,
            },
          },
        },
        license_plate: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        first_registration_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            isDate: { args: true, msg: "First registration date must be a valid date" },
            notInFuture(value: string) {
              const now = dayjs();
              if (value && dayjs(value).isAfter(now, "day")) {
                throw new Error("First registration date cannot be in the future");
              }
            },
          },
        },
        owner_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: "Vehicle",
        tableName: "vehicles",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        defaultScope: {
          where: { deleted_at: null },
        },
        scopes: {
          withDeleted: {
            where: {},
          },
          onlyDeleted: {
            where: { deleted_at: { [Op.not]: null } },
          },
        },
        hooks: {
          beforeValidate: (vehicle: Vehicle) => {
            if (typeof vehicle.model === "string") vehicle.model = vehicle.model.trim();
            if (typeof vehicle.license_plate === "string") vehicle.license_plate = vehicle.license_plate.trim();
          },
        },
      }
    );
  }
}
