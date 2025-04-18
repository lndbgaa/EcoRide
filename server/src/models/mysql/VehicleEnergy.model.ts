import { sequelize } from "@/config/mysql.js";
import { DataTypes, Model } from "sequelize";

/**
 * Modèle représentant une énergie de véhicule.
 *
 * Utilisé pour associer un véhicule à une énergie via `energy_id`.
 *
 * @extends Model
 */

class VehicleEnergy extends Model {
  declare id: string;
  declare label: string;
}

VehicleEnergy.init(
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
    modelName: "VehicleEnergy",
    tableName: "vehicle_energies",
    timestamps: false,
  }
);

export default VehicleEnergy;
