import { DataTypes, Model } from "sequelize";

import type { VehicleBrandPublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class VehicleBrand extends Model {
  declare id: number;
  declare key: string;

  public toPublicDTO(t: TFunction): VehicleBrandPublicDTO {
    const translationKey = `ui:vehicle_brands.${this.key}`;

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
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "VehicleBrand",
        tableName: "vehicle_brands",
        timestamps: false,
      }
    );
  }
}
