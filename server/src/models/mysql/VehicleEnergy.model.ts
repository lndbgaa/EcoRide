import { DataTypes, Model } from "sequelize";

import type { VehicleEnergyPublicDTO } from "@/types";
import type { TFunction } from "i18next";
import type { Sequelize } from "sequelize";

export default class VehicleEnergy extends Model {
  declare id: number;
  declare key: string;

  public toPublicDTO(t: TFunction): VehicleEnergyPublicDTO {
    const translationKey = `display.vehicle_energies.${this.key}`;

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
        modelName: "VehicleEnergy",
        tableName: "vehicle_energies",
        timestamps: false,
      }
    );
  }
}
