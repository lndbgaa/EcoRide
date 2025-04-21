import { sequelize } from "@/config/mysql.config.js";
import { DataTypes, Model } from "sequelize";

/**
 * Modèle représentant une marque de véhicule.
 *
 * Utilisé pour associer un véhicule à une marque via `brand_id`.
 *
 * @extends Model
 */

class VehicleBrand extends Model {
  declare id: string;
  declare label: string;
}

VehicleBrand.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "VehicleBrand",
    tableName: "vehicle_brands",
    timestamps: false,
  }
);

export default VehicleBrand;
