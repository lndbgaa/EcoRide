import { DataTypes, Model, type Sequelize } from "sequelize";

export default class VehicleEnergy extends Model {
  declare id: string;
  declare key: string;
  declare display: string;

  public static initModel(sequelize: Sequelize): void {
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
        display: {
          type: DataTypes.STRING(100),
          allowNull: false,
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
