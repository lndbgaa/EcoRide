import dayjs from "dayjs";
import { DataTypes, Transaction } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import Account from "@/models/mysql/Account.model.js";
import AppError from "@/utils/AppError.js";
import { toDateOnly } from "@/utils/date.utils.js";

export interface UserPublicDTO {
  id: string;
  firstName: string;
  pseudo: string;
  avatar: string | null;
  averageRating: string | null;
  memberSince: string | null;
}

export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  isPassenger: boolean;
  isDriver: boolean;
  credits: number;
  lastLogin: string | null;
}

export interface UserAdminDTO extends UserPublicDTO {
  email: string;
}

/**
 * Modèle représentant un utilisateur standard de la plateforme.
 *
 * Hérite des attributs et méthodes du modèle Account,
 * et ajoute des champs spécifiques à l'utilisateur (pseudo, avatar, note moyenne, crédits, etc.).
 *
 * @extends Accounts
 */

class User extends Account {
  declare pseudo: string;
  declare profile_picture: string | null;
  declare is_passenger: boolean;
  declare is_driver: boolean;
  declare average_rating: string | null;
  declare credits: number;

  /**
   * Active ou désactive le mode conducteur.
   */
  public async toggleDriver(): Promise<void> {
    this.is_driver = !this.is_driver;
    await this.save();
  }

  /**
   * Active ou désactive le mode passager.
   */
  public async togglePassenger(): Promise<void> {
    this.is_passenger = !this.is_passenger;
    await this.save();
  }

  /**
   *  Ajoute des crédits au compte utilisateur.
   */
  public async addCredits(amount: number, options?: { transaction?: Transaction }): Promise<void> {
    if (amount <= 0)
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le montant doit être supérieur à 0.",
      });

    this.credits += amount;
    await this.save(options);
  }

  /**
   * Retire des crédits du compte utilisateur.
   */
  public async removeCredits(amount: number, options?: { transaction?: Transaction }): Promise<void> {
    if (amount <= 0)
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le montant doit être supérieur à 0.",
      });

    if (this.credits < amount)
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Crédits insuffisants.",
      });

    this.credits -= amount;
    await this.save(options);
  }

  public getPseudo(): string {
    return this.pseudo;
  }

  public getAvatar(): string | null {
    return this.profile_picture;
  }

  public getAverageRating(): string | null {
    return this.average_rating;
  }

  public getCredits(): number {
    return this.credits;
  }

  public isDriver(): boolean {
    return this.is_driver;
  }

  public isPassenger(): boolean {
    return this.is_passenger;
  }

  public toPublicDTO(): UserPublicDTO {
    return {
      id: this.id,
      firstName: this.first_name,
      pseudo: this.pseudo,
      avatar: this.profile_picture ?? null,
      averageRating: this.average_rating ?? null,
      memberSince: this.created_at ? toDateOnly(this.created_at) : null,
    };
  }

  public toPrivateDTO(): UserPrivateDTO {
    const lastLogin = this.last_login
      ? `le ${dayjs(this.last_login).tz("Europe/Paris", true).format("DD/MM/YYYY")} à ${dayjs(this.last_login)
          .tz("Europe/Paris", true)
          .format("HH:mm")}`
      : null;

    return {
      ...this.toPublicDTO(),
      email: this.email,
      lastName: this.last_name,
      phone: this.phone ?? null,
      address: this.address ?? null,
      birthDate: this.birth_date ? dayjs(this.birth_date).format("YYYY-MM-DD") : null,
      isPassenger: this.is_passenger,
      isDriver: this.is_driver,
      credits: this.credits,
      lastLogin,
    };
  }
}

User.init(
  Account.defineAttributes(ACCOUNT_ROLES_ID.USER, {
    pseudo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[a-zA-Z0-9_-]{3,20}$/,
      },
    },
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_driver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_passenger: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
  }),
  {
    sequelize,
    modelName: "User",
    tableName: "accounts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: {
      where: {
        role_id: ACCOUNT_ROLES_ID.USER,
      },
    },
  }
);

User.beforeValidate((user: User) => {
  user.role_id = ACCOUNT_ROLES_ID.USER;
});

User.addAccountHooks();

export default User;
