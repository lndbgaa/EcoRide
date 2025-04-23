import type { ModelStatic } from "sequelize";

import bcrypt from "bcrypt";
import { DataTypes } from "sequelize";
import Base from "./Base.model.js";
import Role from "./Role.model.js";

type AccountStatus = "active" | "suspended";

/**
 * Modèle représentant un compte générique.
 *
 * Sert de base pour les modèles 'User', 'Admin', 'Employee'.
 *
 * ⚠️ Ne doit pas être instancié directement.
 *
 * @extends Base
 */

abstract class Account extends Base {
  declare id: string;
  declare role_id: number;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare pseudo: string;
  declare phone: string | null;
  declare address: string | null;
  declare birth_date: Date | null;
  declare profile_picture: string | null;
  declare status: AccountStatus;
  declare last_login: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare suspended_at: Date | null;
  declare deleted_at: Date | null;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare role?: Role;

  /**
   * Génère les attributs Sequelize de base pour un compte.
   *
   * @param roleId - ID du rôle à appliquer.
   * @param additionalAttributes - Champs supplémentaires à ajouter.
   * @returns Les attributs Sequelize pour `Model.init()`.
   *
   *  ⚠️ À utiliser uniquement dans les modèles Sequelize enfants héritant de Account (User, Employee, Admin).
   */
  public static defineAttributes(
    roleId: number,
    additionalAttributes: Record<string, any> = {}
  ): Record<string, any> {
    return {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: roleId,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      pseudo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      suspended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...(["active", "suspended"] as AccountStatus[])),
        defaultValue: "active",
      },
      ...additionalAttributes,
    };
  }

  /**
   * Hooks statiques pour le hachage de mot de passe.
   * Ces hooks seront hérités par les modèles enfants.
   */
  public static addPasswordHooks<T extends Account>(this: ModelStatic<T>) {
    this.beforeCreate(async (account: T) => {
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(account.password, salt);
    });

    this.beforeUpdate(async (account: T) => {
      if (account.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(account.password, salt);
      }
    });
  }

  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async updateLastLogin(): Promise<void> {
    this.last_login = new Date();
    await this.save();
  }

  async suspend(): Promise<void> {
    this.status = "suspended";
    this.suspended_at = new Date();
    await this.save();
  }

  async unsuspend(): Promise<void> {
    this.status = "active";
    this.suspended_at = null;
    await this.save();
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isSuspended(): boolean {
    return this.status === "suspended";
  }
}

export default Account;
