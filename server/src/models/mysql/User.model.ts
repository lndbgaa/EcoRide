import { DataTypes, Transaction } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_ID } from "@/models/mysql/Account.model.js";
import AppError from "@/utils/AppError.js";
import { getAge, toDateOnly } from "@/utils/date.utils.js";
import Account from "./Account.model.js";

export interface UserPublicDTO {
  id: string;
  pseudo: string;
  age: number | null;
  avatar: string | null;
  averageRating: number | null;
  memberSince: number | null;
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

/**
 * Modèle représentant un utilisateur standard de la plateforme.
 *
 * Hérite des attributs et méthodes du modèle Account,
 * et ajoute des champs spécifiques à l'utilisateur (conducteur, passager, note moyenne, crédits).
 *
 * @extends Accounts
 */

class User extends Account {
  declare is_passenger: boolean;
  declare is_driver: boolean;
  declare average_rating: number | null;
  declare credits: number;

  /**
   * Récupère le type de profil de l'utilisateur.
   */
  public async getUserProfileType() {
    const isDriver = this.is_driver;
    const isPassenger = this.is_passenger;

    if (isDriver && isPassenger) {
      return "both";
    }
    if (isDriver) {
      return "driver";
    }
    if (isPassenger) {
      return "passenger";
    }

    throw new AppError({
      statusCode: 500,
      statusText: "Internal Server Error",
      message: "Impossible de déterminer le type de profil de l'utilisateur.",
    });
  }

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
  public async addCredits(
    amount: number,
    options?: { transaction?: Transaction }
  ): Promise<void> {
    if (amount <= 0) throw new Error("Le montant doit être supérieur à 0.");
    this.credits += amount;
    await this.save(options);
  }

  /**
   * Retire des crédits du compte utilisateur.
   */
  public async removeCredits(
    amount: number,
    options?: { transaction?: Transaction }
  ): Promise<void> {
    if (amount <= 0) throw new Error("Le montant doit être supérieur à 0.");
    if (this.credits < amount) throw new Error("Crédits insuffisants.");
    this.credits -= amount;
    await this.save(options);
  }

  public getEmail(): string {
    return this.email;
  }

  public getPseudo(): string {
    return this.pseudo;
  }

  public getFirstName(): string {
    return this.first_name;
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
      pseudo: this.pseudo,
      age: this.birth_date ? getAge(this.birth_date) : null,
      avatar: this.profile_picture ?? null,
      averageRating: this.average_rating ?? null,
      memberSince: this.created_at?.getFullYear() ?? null,
    };
  }

  public toPrivateDTO(): UserPrivateDTO {
    return {
      ...this.toPublicDTO(),
      email: this.email,
      firstName: this.first_name,
      lastName: this.last_name,
      phone: this.phone ?? null,
      address: this.address ?? null,
      birthDate: this.birth_date ? toDateOnly(this.birth_date) : null,
      isPassenger: this.is_passenger,
      isDriver: this.is_driver,
      credits: this.credits,
      lastLogin: this.last_login ? this.last_login.toISOString() : null,
    };
  }
}

User.init(
  Account.defineAttributes(ACCOUNT_ROLES_ID.USER, {
    is_driver: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_passenger: { type: DataTypes.BOOLEAN, defaultValue: true },
    average_rating: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
    credits: { type: DataTypes.INTEGER, defaultValue: 20 },
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
  if (!user.role_id) user.role_id = ACCOUNT_ROLES_ID.USER;
});

User.addPasswordHooks();

export default User;
