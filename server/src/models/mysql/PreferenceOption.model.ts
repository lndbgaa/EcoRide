import { DataTypes, Model } from "sequelize";

import type { PreferenceCategory } from "@/models";
import type { PreferenceCategoryId, PreferenceOptionDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class PreferenceOption extends Model {
  declare id: number;
  declare category_id: PreferenceCategoryId;
  declare key: string;

  declare category?: PreferenceCategory;


  public toDTO(t: TFunction): PreferenceOptionDTO {
    const translationKey = `ui:preference_options.${this.category!.key}.${this.key}`

    return {
      id: this.id,
      category: this.category?.toDTO(t) ?? null,
      key: this.key,
      display: t(translationKey),
    };
  }

  public static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "preference_categories", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        key: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "PreferenceOption",
        tableName: "preference_options",
        timestamps: false,
        hooks: {
          beforeValidate: (option: PreferenceOption) => {
            option.key = option.key.trim().toLowerCase();
          },
        },
      }
    );
  }
}
