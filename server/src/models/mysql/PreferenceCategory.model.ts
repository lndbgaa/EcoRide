import { DataTypes, Model } from "sequelize";

import { PREFERENCE_CATEGORIES_KEY } from "@/constants";

import type {
  PreferenceCategoryId,
  PreferenceCategoryKey,
  PreferenceCategoryPrivateDTO,
} from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class PreferenceCategory extends Model {
  declare id: PreferenceCategoryId;
  declare key: PreferenceCategoryKey;

  private getDisplayTranslationKey(): string {
    return `ui:preference_categories.${this.key}`;
  }

  public toPrivateDTO(t: TFunction): PreferenceCategoryPrivateDTO {
    return {
      id: this.id,
      key: this.key,
      display: t(this.getDisplayTranslationKey()),
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
