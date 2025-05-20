import { sequelize } from "@/config/mysql.config.js";
import { DataTypes, Model } from "sequelize";

class RefreshToken extends Model {
  declare id: number;
  declare token: string;
  declare account_id: string;
  declare expires_at: Date;
  declare revoked_at: Date;
  declare created_at: Date;
  declare updated_at: Date;

  public getAccountId(this: RefreshToken): string {
    return this.account_id;
  }

  public isRevoked(this: RefreshToken): boolean {
    return this.revoked_at !== null;
  }
}

RefreshToken.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    token: { type: DataTypes.STRING, allowNull: false },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "accounts", key: "id" },
      onDelete: "CASCADE",
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "refresh_tokens",
    modelName: "RefreshToken",
    timestamps: false,
  }
);

export default RefreshToken;
