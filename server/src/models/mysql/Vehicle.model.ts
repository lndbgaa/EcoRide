import { sequelize } from "@/config/mysql.js";
import type { ModelStatic } from "sequelize";
import { DataTypes } from "sequelize";
import Base from "./Base.model.js";
import type User from "./User.model.js";
import type VehicleBrand from "./VehicleBrand.model.js";
import type VehicleColor from "./VehicleColor.model.js";
import type VehicleEnergy from "./VehicleEnergy.model.js";

/**
 * Représente la version publique (DTO) d'un véhicule, retournée par l'API.
 */
export interface PublicVehicleDTO {
  id: string;
  brand?: string;
  model: string;
  color?: string;
  seats: number;
  energy?: string;
  license_plate: string;
  first_registration: Date;
  is_eco_vehicle: boolean;
}

/**
 * Modèle représentant un véhicule de la plateforme.
 *
 * @extends Base
 */
class Vehicle extends Base {
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

  declare is_eco_vehicle?: boolean;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare owner?: User;
  declare brand?: VehicleBrand;
  declare color?: VehicleColor;
  declare energy?: VehicleEnergy;

  // Récupère tous les véhicules appartenant à un utilisateur donné.
  static async findByOwner(this: ModelStatic<Vehicle>, ownerId: string): Promise<Vehicle[]> {
    try {
      const vehicles = await this.findAll({
        where: { owner_id: ownerId },
        include: [{ association: "brand" }, { association: "color" }, { association: "energy" }],
      });
      return vehicles;
    } catch (err) {
      const message = `[${this.name}] findByOwner → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  // Indique si le véhicule est considéré comme éco-responsable.
  // Déterminé par l'ID d'énergie (ex : électrique = 3, hydrogène = 9).
  isEcoVehicle(): boolean {
    const ECO_FRIENDLY_IDS = [3, 9];
    return ECO_FRIENDLY_IDS.includes(this.energy_id);
  }

  // Retourne une version "publique" du véhicule, prête à être exposée via l'API.
  // Masque les données techniques (IDs).
  toJSON(): PublicVehicleDTO {
    return {
      id: this.id,
      brand: this.brand?.label ?? undefined,
      model: this.model,
      color: this.color?.label ?? undefined,
      energy: this.energy?.label ?? undefined,
      seats: this.seats,
      license_plate: this.license_plate,
      first_registration: this.first_registration,
      is_eco_vehicle: this.isEcoVehicle(),
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
        isBefore: {
          args: new Date().toISOString().split("T")[0],
          msg: "La date de première immatriculation doit être antérieure à la date actuelle.",
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
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Vehicle",
    tableName: "vehicles",
    timestamps: true,
    underscored: true,
  }
);

export default Vehicle;
