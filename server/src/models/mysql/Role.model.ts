import { DataTypes, Model, type Sequelize } from "sequelize";

import { USER_ROLES_DISPLAY, USER_ROLES_KEY } from "@/constants";

import type { UserRoleDisplay, UserRoleId, UserRoleKey } from "@/types";

export default class Role extends Model {
  declare id: UserRoleId;
  declare key: UserRoleKey;
  declare display: UserRoleDisplay;

  public static initModel(sequelize: Sequelize): void {
    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        key: {
          type: DataTypes.ENUM(...Object.values(USER_ROLES_KEY)),
          allowNull: false,
          unique: true,
        },
        display: {
          type: DataTypes.ENUM(...Object.values(USER_ROLES_DISPLAY)),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Role",
        tableName: "roles",
        timestamps: false,
      }
    );
  }
}
