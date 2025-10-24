import { DataTypes, Model, type Sequelize } from "sequelize";

export default class PreferenceOption extends Model {
  declare id: number;
  declare category_id: number;
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
        display: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        icon: {
          type: DataTypes.STRING(100),
          allowNull: true, // FIXME mettre à false quand icones prêtes
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
