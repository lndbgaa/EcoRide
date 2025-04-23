import { DataTypes } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import Base from "./Base.model.js";
import VehicleBrand from "./VehicleBrand.model.js";
import VehicleColor from "./VehicleColor.model.js";
import VehicleEnergy from "./VehicleEnergy.model.js";

const ECO_ENERGY_IDS = [3, 9];

export interface VehiclePublicDTO {
  id: string;
  brand: string | null;
  model: string;
  color: string | null;
  seats: number;
  energy: string | null;
}

export interface VehiclePrivateDTO extends VehiclePublicDTO {
  license_plate: string;
  first_registration: Date;
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

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare brand?: VehicleBrand;
  declare color?: VehicleColor;
  declare energy?: VehicleEnergy;

  /**
   * Récupère tous les véhicules appartenant à un utilisateur donné.
   */
  static async findAllByOwner(ownerId: string): Promise<Vehicle[]> {
    if (!ownerId || typeof ownerId !== "string") {
      throw new Error("ID propriétaire véhicule invalide.");
    }

    return await this.findAllByField("owner_id", ownerId, {
      include: [{ association: "brand" }, { association: "color" }, { association: "energy" }],
    });
  }

  /**
   * Indique si le véhicule est considéré comme éco-responsable.
   * Déterminé par l'ID d'énergie (ex : électrique = 3, hydrogène = 9).
   */
  isEcoVehicle(): boolean {
    return ECO_ENERGY_IDS.includes(this.energy_id);
  }

  /**
   * Retourne une version "publique" du véhicule.
   *
   * 💡 Utile pour afficher le véhicule utiliser pour un covoiturage.
   */
  toPublicDTO(): VehiclePublicDTO {
    return {
      id: this.id,
      brand: this.brand?.label ?? null,
      model: this.model,
      color: this.color?.label ?? null,
      energy: this.energy?.label ?? null,
      seats: this.seats,
    };
  }

  /**
   * Retourne une version "privée" du véhicule.
   *
   * 💡 Utile pour que l'utilisateur puisse visionner ses véhicules.
   */
  toPrivateDTO(): VehiclePrivateDTO {
    return {
      ...this.toPublicDTO(),
      license_plate: this.license_plate,
      first_registration: this.first_registration,
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
