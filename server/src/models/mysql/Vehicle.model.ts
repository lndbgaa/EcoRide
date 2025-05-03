import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { VEHICLE_ECO_ENERGY_IDS } from "@/constants/index.js";
import VehicleBrand from "@/models/mysql/VehicleBrand.model.js";
import VehicleColor from "@/models/mysql/VehicleColor.model.js";
import VehicleEnergy from "@/models/mysql/VehicleEnergy.model.js";
import AppError from "@/utils/AppError.js";
import { toDateOnly } from "@/utils/date.utils.js";

export interface VehiclePublicDTO {
  id: string;
  brand: string | null;
  model: string;
  color: string | null;
  energy: string | null;
}

export interface VehiclePrivateDTO extends VehiclePublicDTO {
  seats: number;
  license_plate: string;
  first_registration: string;
}

/**
 * Modèle représentant un véhicule de la plateforme.
 *
 * @extends Base
 */
class Vehicle extends Model {
  declare id: string;
  declare brand_id: number;
  declare model: string;
  declare color_id: number;
  declare energy_id: number;
  declare seats: number;
  declare license_plate: string;
  declare first_registration: Date;
  declare owner_id: string;
  declare created_at: Date;
  declare updated_at: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare brand?: VehicleBrand;
  declare color?: VehicleColor;
  declare energy?: VehicleEnergy;

  public isEcoVehicle(): boolean {
    return VEHICLE_ECO_ENERGY_IDS.includes(this.energy_id);
  }

  public getSeats(): number {
    return this.seats;
  }

  public getOwnerId(): string {
    return this.owner_id;
  }

  public toPublicDTO(): VehiclePublicDTO {
    return {
      id: this.id,
      brand: this.brand?.label ?? null,
      model: this.model,
      color: this.color?.label ?? null,
      energy: this.energy?.label ?? null,
    };
  }

  public toPrivateDTO(): VehiclePrivateDTO {
    return {
      ...this.toPublicDTO(),
      seats: this.seats,
      license_plate: this.license_plate,
      first_registration: toDateOnly(this.first_registration),
    };
  }
}

Vehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehicle_brands",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehicle_colors",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    energy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehicle_energies",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [2],
          msg: "Le véhicule (voiture) doit avoir au moins deux places.",
        },
        max: {
          args: [7],
          msg: "Le véhicule (voiture) doit avoir maximum 7 places.",
        },
      },
    },
    license_plate: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        is: {
          args: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i,
          msg: "Format de plaque invalide. Format attendu : AB-123-CD",
        },
      },
    },
    first_registration: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isBeforeToday(value: Date): void {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const input = new Date(value);
          input.setHours(0, 0, 0, 0);

          if (input > now) {
            throw new AppError({
              statusCode: 400,
              statusText: "Bad Request",
              message:
                "La date de première immatriculation doit être antérieure à la date actuelle.",
            });
          }
        },
      },
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
  },
  {
    sequelize,
    modelName: "Vehicle",
    tableName: "vehicles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Vehicle;
