import { DataTypes, Model } from "sequelize";

import { dayjs } from "@/config";

import type { SaveOptions, Sequelize } from "sequelize";

export default class RefreshToken extends Model {
  declare id: string;
  declare token: string;
  declare user_id: string;
  declare expires_at: Date;
  declare used_at: Date | null;
  declare revoked_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isExpired(): boolean {
    return dayjs().isAfter(this.expires_at);
  }

  public isUsed(): boolean {
    return this.used_at !== null;
  }

  public isRevoked(): boolean {
    return this.revoked_at !== null;
  }

  public isActive(): boolean {
    return !(this.isExpired() || this.isUsed() || this.isRevoked());
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsUsed(options?: SaveOptions): Promise<void> {
    if (this.used_at !== null) return;
    this.used_at = dayjs().toDate();
    await this.save({ ...options, fields: ["used_at"] });
  }

  public async markAsRevoked(options?: SaveOptions): Promise<void> {
    if (this.revoked_at !== null) return;
    this.revoked_at = dayjs().toDate();
    await this.save({ ...options, fields: ["revoked_at"] });
  }

  // ----------------------------
  // Model Init
  // ----------------------------

  public static initModel(sequelize: Sequelize) {
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
        revoked_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "RefreshToken",
        tableName: "refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
}
