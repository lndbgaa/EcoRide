import { sequelize } from "@/config/mysql.js";
import { DataTypes, Model } from "sequelize";

/**
 * Modèle représentant un rôle de compte (user, employee, admin).
 *
 * Utilisé pour associer chaque compte à un type via `role_id`.
 *
 * @extends Model
 */

class Role extends Model {
  declare id: number;
  declare label: string;
}

Role.init(
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
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
  }
);

export default Role;
