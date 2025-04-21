import { sequelize } from "@/config/mysql.js";
import { getAge } from "@/utils/date.utils.js";
import { DataTypes } from "sequelize";
import Account from "./Account.model.js";
import Review from "./Review.model.js";

const USER_ROLE_ID = 3;

export interface UserPublicDTO {
  id: string;
  pseudo: string;
  age: string | null;
  profile_picture: string | null;
  average_rating: number | null;
  member_since: number | null;
}

export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  birth_date: Date | null;
  is_passenger: boolean;
  is_driver: boolean;
  credits: number;
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

  public static async findOneByEmail(email: string): Promise<User> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    const user = await this.findOneByField("email", email, {
      include: [{ association: "role" }],
    });

    if (!user) {
      throw new Error(`Aucun compte trouvé pour l'adresse : ${email}`);
    }

    if (user.role_id !== USER_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un utilisateur");
    }

    return user;
  }

  public static async findOneByPseudo(pseudo: string): Promise<User> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères");
    }

    const account = await User.findOneByField("pseudo", pseudo, {
      include: [{ association: "role" }],
    });

    if (!account) {
      throw new Error(`Aucun compte trouvé pour le pseudo: ${pseudo}`);
    }

    if (account.role_id !== USER_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un utilisateur");
    }

    return account;
  }

  /**
   * Active ou désactive le mode conducteur.
   */
  async toggleDriver(): Promise<void> {
    this.is_driver = !this.is_driver;
    await this.save();
  }

  /**
   * Active ou désactive le mode passager.
   */
  async togglePassenger(): Promise<void> {
    this.is_passenger = !this.is_passenger;
    await this.save();
  }

  /**
   * Met à jour la note moyenne de l'utilisateur à partir des avis reçus.
   */
  async updateAverageRating(): Promise<void> {
    const result = (await Review.findOne({
      where: { target_id: this.id },
      attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avg"]],
      raw: true,
    })) as { avg: string | null } | null;

    this.average_rating = parseFloat(result?.avg ?? "0");
    await this.save();
  }

  /**
   *  Ajoute des crédits au compte utilisateur.
   */
  async addCredits(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Le montant doit être supérieur à 0.");
    this.credits += amount;
    await this.save();
  }

  /**
   * Retire des crédits du compte utilisateur.
   */
  async removeCredits(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Le montant doit être supérieur à 0.");
    if (this.credits < amount) throw new Error("Crédits insuffisants.");
    this.credits -= amount;
    await this.save();
  }

  /**
   * Retourne les informations publiques de l'utilisateur.
   *
   * 💡 Utile lorsque ces informations sont consultées par un autre utilisateur (ex: liste passagers covoiturage).
   */
  toPublicJSON(): UserPublicDTO {
    return {
      id: this.id,
      pseudo: this.pseudo,
      age: this.birth_date ? getAge(this.birth_date) : null,
      profile_picture: this.profile_picture,
      average_rating: this.average_rating,
      member_since: this.created_at?.getFullYear() ?? null,
    };
  }

  /**
   * Retourne les informations privées de l'utilisateur.
   *
   * 💡 Utile lorsque l'utilisateur lui-même consulte son profil.
   */
  toPrivateJSON(): UserPrivateDTO {
    return {
      ...this.toPublicJSON(),
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      phone: this.phone,
      address: this.address,
      birth_date: this.birth_date,
      is_passenger: this.is_passenger,
      is_driver: this.is_driver,
      credits: this.credits,
    };
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

User.beforeValidate((user: User) => {
  if (!user.role_id) user.role_id = USER_ROLE_ID;
});

User.addPasswordHooks();

export default User;
