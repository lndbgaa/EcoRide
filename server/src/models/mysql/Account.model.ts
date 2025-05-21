import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";

import { ACCOUNT_ROLES_ID, ACCOUNT_STATUSES } from "@/constants/index.js";
import Role from "@/models/mysql/Role.model.js";
import AppError from "@/utils/AppError.js";

import type { AccountRoleId, AccountStatus } from "@/types/index.js";
import type { ModelAttributes, ModelStatic, Transaction } from "sequelize";

/**
 * Modèle représentant un compte générique.
 *
 * Sert de base pour les modèles 'User', 'Admin', 'Employee'.
 *
 * ⚠️ Ne doit pas être instancié directement.
 *
 * @extends Base
 */

abstract class Account extends Model {
  declare id: string;
  declare role_id: number;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare phone: string | null;
  declare address: string | null;
  declare birth_date: Date | null;
  declare status: AccountStatus;
  declare last_login: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare suspended_at: Date | null;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare role?: Role;

  /**
   * Génère les attributs Sequelize de base pour un compte.
   * @param roleId - ID du rôle à appliquer.
   * @param additionalAttributes - Champs supplémentaires à ajouter.
   * @returns Les attributs Sequelize pour `Model.init()`.
   *
   *  ⚠️ À utiliser uniquement dans les modèles Sequelize enfants héritant de Account (User, Employee, Admin).
   */
  public static defineAttributes<T extends object>(
    roleId: AccountRoleId,
    additionalAttributes: ModelAttributes = {}
  ): ModelAttributes {
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
        references: {
          model: "roles",
          key: "id",
        },
        validate: {
          isIn: [Object.values(ACCOUNT_ROLES_ID)],
        },
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
      last_login: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      suspended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ACCOUNT_STATUSES)),
        defaultValue: ACCOUNT_STATUSES.ACTIVE,
      },
      ...additionalAttributes,
    };
  }

  public static addAccountHooks<T extends Account>(this: ModelStatic<T>) {
    this.beforeCreate(async (account: T) => {
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(account.password, salt);
    });

    this.beforeUpdate(async (account: T) => {
      if (account.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(account.password, salt);
      }

      if (account.changed("role_id")) {
        throw new AppError({
          statusCode: 400,
          statusText: "Bad Request",
          message: "Impossible de modifier le rôle d'un compte.",
        });
      }
    });
  }

  public async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public async updateLastLogin(options?: { transaction?: Transaction }): Promise<void> {
    this.last_login = new Date();
    await this.save(options);
  }

  public async suspend(): Promise<void> {
    this.status = ACCOUNT_STATUSES.SUSPENDED;
    this.suspended_at = new Date();
    await this.save();
  }

  public async unsuspend(): Promise<void> {
    this.status = ACCOUNT_STATUSES.ACTIVE;
    this.suspended_at = null;
    await this.save();
  }

  public isActive(): boolean {
    return this.status === ACCOUNT_STATUSES.ACTIVE;
  }

  public isSuspended(): boolean {
    return this.status === ACCOUNT_STATUSES.SUSPENDED;
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getFirstName(): string {
    return this.first_name;
  }

  public getLastName(): string {
    return this.last_name;
  }

  public getPhone(): string | null {
    return this.phone;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getBirthDate(): Date | null {
    return this.birth_date;
  }

  public getLastLogin(): Date {
    return this.last_login;
  }

  public getCreatedAt(): Date {
    return this.created_at;
  }

  public getUpdatedAt(): Date {
    return this.updated_at;
  }

  public getSuspendedAt(): Date | null {
    return this.suspended_at;
  }
}

export default Account;
