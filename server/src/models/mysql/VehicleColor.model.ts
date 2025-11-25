import { DataTypes, Model } from "sequelize";

import type { VehicleColorPublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class VehicleColor extends Model {
  declare id: number;
  declare key: string;

  public toPublicDTO(t: TFunction): VehicleColorPublicDTO {
    const translationKey = `ui:vehicle_colors.${this.key}`;

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
        modelName: "VehicleColor",
        tableName: "vehicle_colors",
        timestamps: false,
      }
    );
  }
}
