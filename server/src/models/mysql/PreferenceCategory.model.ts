import { DataTypes, Model } from "sequelize";

import { PREFERENCE_CATEGORIES_KEY } from "@/constants";

import type {
  PreferenceCategoryDTO,
  PreferenceCategoryId,
  PreferenceCategoryKey,
} from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class PreferenceCategory extends Model {
  declare id: PreferenceCategoryId;
  declare key: PreferenceCategoryKey;


  public toDTO(t: TFunction): PreferenceCategoryDTO {
    const translationKey = `ui:preference_categories.${this.key}`
    
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
