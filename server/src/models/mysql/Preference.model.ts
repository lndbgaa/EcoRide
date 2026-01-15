import { DataTypes, Model } from "sequelize";

import { PREFERENCE_ERROR_MESSAGES } from "@/constants";
import type { PreferenceOption } from "@/models/mysql";
import type { PreferenceDTO } from "@/types";
import { AppError } from "@/utils";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class Preference extends Model {
  declare id: string;
  declare user_id: string;
  declare option_id: number;
  declare category_id: number;

  declare option?: PreferenceOption;

  public toDTO(t: TFunction): PreferenceDTO {
    return {
      id: this.id,
      option: this.option?.toDTO(t) ?? null,
    };
  }

  public static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        option_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "preference_options", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Preference",
        tableName: "preferences",
        timestamps: false,
        indexes: [
          {
            unique: true,
            name: "unique_user_category",
            fields: ["user_id", "category_id"],
          },
        ],
        hooks: {
          async beforeValidate(preference: Preference) {
            if (preference.option_id) {
              const option = (await preference.sequelize.models.PreferenceOption?.findByPk(preference.option_id, {
                attributes: ["category_id"],
              })) as PreferenceOption | null;

              if (!option) {
                throw new AppError({
                  statusCode: 500,
                  userMessageKey: PREFERENCE_ERROR_MESSAGES.INVALID_OPTION,
                  debugMessage: `[Preference.beforeValidate] PreferenceOption with id ${preference.option_id} not found`,
                });
              }

              preference.category_id = option.category_id;
            }
          },
        },
      }
    );
  }
}
