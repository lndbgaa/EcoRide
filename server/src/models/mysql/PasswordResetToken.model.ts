import { DataTypes, Model, type Sequelize } from "sequelize";

export default class PasswordResetToken extends Model {
  declare id: string;
  declare token: string;
  declare user_id: string;
  declare expires_at: Date;
  declare used_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  public static initModel(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        used_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "PasswordResetToken",
        tableName: "password_reset_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
}
