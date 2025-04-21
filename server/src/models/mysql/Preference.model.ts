import { sequelize } from "@/config/mysql.config.js";
import { DataTypes, UUIDV4 } from "sequelize";
import Base from "./Base.model.js";

class Preference extends Base {
  declare id: string;
  declare user_id: string;
  declare label: string;
  declare value: boolean;
  declare is_custom: boolean;

  // Récupère toutes les préférences d'un utilisateur donné.
  static async findByUser(userId: string): Promise<Preference[]> {
    try {
      const preferences = await this.findAll({ where: { user_id: userId } });
      return preferences;
    } catch (err) {
      const message = `[${this.name}] findByUser → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }
}

Preference.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    value: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_custom: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Preference",
    tableName: "preferences",
    timestamps: false,
    indexes: [{ unique: true, fields: ["user_id", "label"] }], // pas de doublons
  }
);

export default Preference;
