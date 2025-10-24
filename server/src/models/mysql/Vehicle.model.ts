import dayjs from "dayjs";
import { DataTypes, Model, Op } from "sequelize";

import {
  REGEX,
  VEHICLE_ECO_ENERGY_KEYS,
  VEHICLE_MAX_SEATS,
  VEHICLE_MIN_SEATS,
  VEHICLE_STATUSES,
} from "@/constants";

import { toDateOnly } from "@/utils";

import type { User, VehicleBrand, VehicleColor, VehicleEnergy } from "@/models/mysql";
import type { VehicleAdminDTO, VehiclePrivateDTO, VehiclePublicDTO, VehicleStatus } from "@/types";
import type { SaveOptions, Sequelize } from "sequelize";

const { ACTIVE, ARCHIVED } = VEHICLE_STATUSES;

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
  declare status: VehicleStatus;
  declare created_at: Date;
  declare updated_at: Date;

  declare brand?: VehicleBrand;
  declare color?: VehicleColor;
  declare energy?: VehicleEnergy;
  declare owner?: User;

  // ----------------------------
  // Getters
  // ----------------------------

  public get isEcoVehicle(): boolean {
    return VEHICLE_ECO_ENERGY_KEYS.includes(this.energy?.key ?? "");
  }

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isActive(): boolean {
    return this.status === ACTIVE;
  }

  public isArchived(): boolean {
    return this.status === ARCHIVED;
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsArchived(options?: SaveOptions): Promise<void> {
    if (this.status === ARCHIVED) return;
    this.status = ARCHIVED;
    await this.save({ ...options, fields: ["status"] });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(): VehiclePublicDTO {
    return {
      id: this.id,
      brand: this.brand?.display ?? null,
      model: this.model,
      color: this.color?.display ?? null,
      energy: this.energy?.display ?? null,
      seats: this.seats,
      isEco: this.isEcoVehicle,
    };
  }

  public toPrivateDTO(): VehiclePrivateDTO {
    return {
      ...this.toPublicDTO(),
      licensePlate: this.license_plate,
      firstRegistrationDate: toDateOnly(this.first_registration_date),
    };
  }

  public toAdminDTO(): VehicleAdminDTO {
    return {
      ...this.toPrivateDTO(),
      status: this.status,
      owner: this.owner?.toPublicDTO() ?? null,
    };
  }

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
          validate: { notEmpty: { msg: "Model is required." } },
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
              msg: `Vehicle must have at least ${VEHICLE_MIN_SEATS} seats.`,
            },
            max: {
              args: [VEHICLE_MAX_SEATS],
              msg: `Vehicle cannot have more than ${VEHICLE_MAX_SEATS} seats.`,
            },
          },
        },
        license_plate: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            is: { args: REGEX.licensePlate, msg: "License plate must match the format XX-123-XX." },
          },
        },
        first_registration_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          validate: {
            notInFuture(value: string) {
              const now = dayjs();
              if (value && dayjs(value).isAfter(now, "day")) {
                throw new Error("First registration date cannot be in the future.");
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
        status: {
          type: DataTypes.ENUM(...Object.values(VEHICLE_STATUSES)),
          allowNull: false,
          defaultValue: ACTIVE,
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
          where: {
            status: { [Op.ne]: ARCHIVED },
          },
        },
      }
    );
  }
}
