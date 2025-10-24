import { DataTypes, Model, type Sequelize } from "sequelize";

export default class PreferenceCategory extends Model {
  declare id: number;
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
        modelName: "PreferenceCategory",
        tableName: "preference_categories",
        timestamps: false,
        hooks: {
          beforeValidate: (category: PreferenceCategory) => {
            category.key = category.key.trim().toLowerCase();
          },
        },
      }
    );
  }
}
