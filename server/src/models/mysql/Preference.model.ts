import { DataTypes, Model, UUIDV4 } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";

export interface PreferencePrivateDTO {
  id: string;
  label: string;
  value: boolean;
  isCustom: boolean;
}

class Preference extends Model {
  declare id: string;
  declare user_id: string;
  declare label: string;
  declare value: boolean;
  declare is_custom: boolean;
  declare created_at: Date;
  declare updated_at: Date;

  public async toggleValue(): Promise<void> {
    this.value = !this.value;
    await this.save();
  }

  public getLabel(): string {
    return this.label;
  }

  public getValue(): boolean {
    return this.value;
  }

  public isDefault(): boolean {
    return !this.is_custom;
  }

  public isCustom(): boolean {
    return this.is_custom;
  }

  public toPrivateDTO(): PreferencePrivateDTO {
    return {
      id: this.id,
      label: this.label,
      value: this.value,
      isCustom: this.is_custom,
    };
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["user_id", "label"] }], // pas de doublons
  }
);

export default Preference;
