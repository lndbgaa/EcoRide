import { DataTypes, Model } from "sequelize";

import type { PreferenceCategory } from "@/models/mysql";
import type {
  PreferenceCategoryId,
  PreferenceCategoryKey,
  PreferenceOptionPublicDTO,
} from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class PreferenceOption extends Model {
  declare id: number;
  declare category_id: PreferenceCategoryId;
  declare key: string;

  declare category?: PreferenceCategory;

  public toPublicDTO(
    t: TFunction,
    categoryKey: PreferenceCategoryKey | undefined
  ): PreferenceOptionPublicDTO {
    let displayValue: string;

    if (categoryKey) {
      const translationKey = `ui:preference_options.${categoryKey}.${this.key}`;
      displayValue = t(translationKey);
    } else {
      displayValue = this.key;
    }

    return {
      id: this.id,
      categoryId: this.category_id,
      key: this.key,
      display: displayValue,
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
