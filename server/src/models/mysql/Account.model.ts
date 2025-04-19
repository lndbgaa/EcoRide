import bcrypt from "bcrypt";
import { DataTypes } from "sequelize";
import Base from "./Base.model.js";
import type Role from "./Role.model.js";

/**
 * Modèle représentant un compte générique.
 *
 * Sert de base pour les modèles 'User', 'Admin', 'Employee'.
 *
 * ⚠️ Ne doit pas être instancié directement.
 *
 * @extends Base
 */

class Account extends Base {
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
  declare status?: "active" | "suspended" | "inactive" | "deleted";
  declare last_login?: Date;
  declare updated_at?: Date;
  declare created_at?: Date;
  declare suspended_at: Date | null;
  declare deleted_at: Date | null;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare role?: Role;

  /**
   * Génère les attributs Sequelize de base pour un compte.
   *
   * ⚠️ À utiliser uniquement dans `Model.init()` d'un modèle enfant (User, Admin, Employee).
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
        validate: {
          isIn: [[roleId]],
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true, notEmpty: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pseudo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "suspended", "inactive", "deleted"),
        defaultValue: "active",
      },
      ...additionalAttributes,
    };
  }

  /**
   * Récupère un compte à partir d'un email.
   *
   * Utile pour la connexion et l'inscription.
   */
  public static async findOneByEmail(email: string): Promise<Account> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    const account = await this.findOneByField("email", email, {
      include: [{ association: "role" }],
    });

    if (!account) {
      throw new Error(`Aucun compte trouvé pour l'adresse : ${email}`);
    }

    return account;
  }

  /**
   * Récupère un  compte utilisateur à partir d'un pseudo.
   *
   * Utile pour la recherche par un admin par exemple.
   */
  public static async findOneByPseudo(pseudo: string): Promise<Account> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error(`Le pseudo doit être une chaîne de caractères.`);
    }

    const account = await this.findOneByField("pseudo", pseudo, {
      include: [{ association: "role" }],
    });

    if (!account) {
      throw new Error(`Aucun compte trouvé pour le pseudo: ${pseudo}`);
    }

    return account;
  }

  /**
   * Soft-delete d'un compte à partir de son identifiant.
   */
  public static async deleteOneSoft(id: string): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { deleted_at: new Date(), status: "deleted" },
        {
          where: { id },
          individualHooks: true,
        }
      );

      if (affectedRows === 0) {
        throw new Error(`Le compte avec l'identifiant ${id} est introuvable.`);
      }

      return affectedRows;
    } catch (err) {
      const message = `[${
        this.name
      }] deleteOneSoft → Suppression partielle du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Suspend un compte en définissant la date de suspension et le statut.
   */
  public static async suspendOne(id: string): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { suspended_at: new Date(), status: "suspended" },
        {
          where: { id },
          individualHooks: true,
        }
      );

      if (affectedRows === 0) {
        throw new Error(`Le compte avec l'identifiant ${id} est introuvable.`);
      }

      return affectedRows;
    } catch (err) {
      const message = `[${this.name}] suspendOne → Suspension du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Réactive un compte en réinitialisant les champs de suspension et de suppression.
   */
  public static async reactivateOne(id: string): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { suspended_at: null, deleted_at: null, status: "active" },
        {
          where: { id },
          individualHooks: true,
        }
      );

      if (affectedRows === 0) {
        throw new Error(`Le compte avec l'identifiant ${id} est introuvable.`);
      }

      return affectedRows;
    } catch (err) {
      const message = `[${this.name}] reactivateOne → Réactivation du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async updateLastLogin(): Promise<void> {
    this.last_login = new Date();
    await this.save();
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isSuspended(): boolean {
    return this.status === "suspended";
  }

  isDeleted(): boolean {
    return this.status === "deleted";
  }
}

export default Account;
