import { DataTypes, Model } from "sequelize";

import { PREFERENCE_CATEGORIES_KEY } from "@/constants";

import type { PreferenceCategoryId, PreferenceCategoryKey, PreferenceCategoryPublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class PreferenceCategory extends Model {
  declare id: PreferenceCategoryId;
  declare key: PreferenceCategoryKey;

  public toPublicDTO(t: TFunction): PreferenceCategoryPublicDTO {
    const translationKey = `display.preference_categories.${this.key}`;

    return {
      id: this.id,
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
        key: {
          type: DataTypes.ENUM(...Object.values(PREFERENCE_CATEGORIES_KEY)),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "PreferenceCategory",
        tableName: "preference_categories",
        timestamps: false,
      }
    );
  }
}
