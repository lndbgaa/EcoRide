import { sequelize } from "@/config/mysql.config.js";
import { DataTypes } from "sequelize";
import Base from "./Base.model.js";

class RefreshToken extends Base {
  declare id: number;
  declare token: string;
  declare account_id: string;
  declare expires_at: Date;
  declare created_at: Date;
  declare updated_at: Date;
}

RefreshToken.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING, allowNull: false },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "accounts", key: "id" },
      onDelete: "CASCADE",
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
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
