import { DataTypes, Model, type Sequelize } from "sequelize";

export default class Preference extends Model {
  declare id: string;
  declare user_id: string;
  declare option_id: number;

  public static initModel(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        option_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "preference_options", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
      },
      {
        sequelize,
        modelName: "Preference",
        tableName: "preferences",
        timestamps: false,
        indexes: [
          {
            unique: true,
            name: "unique_option_per_user",
            fields: ["user_id", "option_id"],
          },
        ],
      }
    );
  }
}
