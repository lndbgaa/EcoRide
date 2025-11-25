import { DataTypes, Model } from "sequelize";

import { USER_ROLES_KEY } from "@/constants";

import type { UserRoleId, UserRoleKey, UserRolePublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";
export default class Role extends Model {
  declare id: UserRoleId;
  declare key: UserRoleKey;

  public toPublicDTO(t: TFunction): UserRolePublicDTO {
    const translationKey = `display.user_roles.${this.key}`;
    return {
      id: this.id,
      key: this.key,
      display: t(translationKey),
    };
  }

  public static initModel(sequelize: Sequelize) {
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
