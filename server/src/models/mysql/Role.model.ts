import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";

import type { AccountRoleId, AccountRoleLabel } from "@/types/index.js";

/**
 * Modèle représentant un rôle de compte.
 *
 * @extends Model
 */

class Role extends Model {
  declare id: AccountRoleId;
  declare label: AccountRoleLabel;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.ENUM(...Object.values(ACCOUNT_ROLES_LABEL)),
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
