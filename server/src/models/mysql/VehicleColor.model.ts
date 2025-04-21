import { sequelize } from "@/config/mysql.config.js";
import { DataTypes, Model } from "sequelize";

/**
 * Modèle représentant une couleur de véhicule.
 *
 * Utilisé pour associer un véhicule à une couleur via `color_id`.
 *
 * @extends Model
 */

class VehicleColor extends Model {
  declare id: string;
  declare label: string;
}

VehicleColor.init(
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
    modelName: "VehicleColor",
    tableName: "vehicle_colors",
    timestamps: false,
  }
);

export default VehicleColor;
