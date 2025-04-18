import { sequelize } from "@/config/mysql.js";
import { DataTypes } from "sequelize";
import Account from "./Account.model.js";

const USER_ROLE_ID = 3;

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
  declare average_rating?: number;
  declare credits: number;

  isPassenger(): boolean {
    return this.is_passenger;
  }

  isDriver(): boolean {
    return this.is_driver;
  }

  async toggleDriver(): Promise<void> {
    this.is_driver = !this.is_driver;
    await this.save();
  }

  async togglePassenger(): Promise<void> {
    this.is_passenger = !this.is_passenger;
    await this.save();
  }

  hasEnoughCredits(amount: number): boolean {
    return this.credits >= amount;
  }

  async addCredits(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Montant invalide");
    this.credits += amount;
    await this.save();
  }

  async deductCredits(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Montant invalide");
    if (this.credits < amount) throw new Error("Crédits insuffisants");
    this.credits -= amount;
    await this.save();
  }
}

User.init(
  Account.defineAttributes(USER_ROLE_ID, {
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
  }
);

Account.addPasswordHooks(User);

User.beforeValidate((user: User) => {
  if (!user.role_id) user.role_id = USER_ROLE_ID;
});

export default User;
