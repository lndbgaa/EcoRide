import { DataTypes, Model } from "sequelize";

import type { PreferenceCategory, PreferenceOption } from "@/models/mysql";
import type { PreferencePublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class Preference extends Model {
  declare id: string;
  declare user_id: string;
  declare option_id: number;
  declare category_id: number;

  declare option?: PreferenceOption;
  declare category?: PreferenceCategory;

  public toPublicDTO(t: TFunction): PreferencePublicDTO {
    return {
      id: this.id,
      userId: this.user_id,
      option: this.option?.toPublicDTO(t, this.category?.key) ?? null,
      category: this.category?.toPublicDTO(t) ?? null,
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
          references: { model: "preference_categories", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
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
            if (!preference.category_id && preference.option_id) {
              const option = (await preference.sequelize.models.PreferenceOption?.findByPk(
                preference.option_id
              )) as PreferenceOption | null;

              if (option) preference.category_id = option.category_id;
            }
          },
        },
      }
    );
  }
}
