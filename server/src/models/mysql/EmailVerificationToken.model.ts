import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import type { SaveOptions, Sequelize } from "sequelize";

export default class EmailVerificationToken extends Model {
  declare id: string;
  declare token: string;
  declare user_id: string;
  declare expires_at: Date;
  declare used_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  public isValid(): boolean {
    return this.used_at === null && dayjs(this.expires_at).isAfter(dayjs());
  }

  public async markAsUsed(options?: SaveOptions): Promise<void> {
    if (this.used_at !== null) return;
    this.used_at = dayjs().toDate();
    await this.save({ ...options, fields: ["used_at"] });
  }

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
        modelName: "EmailVerificationToken",
        tableName: "email_verification_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
}
