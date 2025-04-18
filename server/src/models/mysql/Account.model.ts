import bcrypt from "bcrypt";
import type { ModelStatic, WhereOptions } from "sequelize";
import { DataTypes, Model } from "sequelize";
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
  declare createdAt: Date;
  declare updatedAt: Date;
  declare last_login: Date;
  declare deleted_at: Date | null;
  declare suspended_at: Date | null;
  declare status: "active" | "suspended" | "inactive" | "deleted";
  declare role?: Role; // Association Sequelize : rôle associé au compte (chargé via include)

  // === Méthodes statiques ===

  /**
   * Génère les attributs Sequelize d'un compte.
   */
  static defineAttributes(
    roleId: number,
    additionalAttributes: Record<string, any> = {}
  ): Record<string, any> {
    return {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[roleId]],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
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
   * Définit les hooks de création/mise à jour pour hasher le mot de passe d'un compte.
   */
  static addPasswordHooks(model: typeof Account) {
    model.beforeCreate(async (account: Account) => {
      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(account.password, salt);
    });

    model.beforeUpdate(async (account: Account) => {
      if (account.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(account.password, salt);
      }
    });
  }

  /**
   * Récupère un compte à partir d'un email.
   */
  static async findByEmail<T extends Model>(
    this: ModelStatic<T>,
    email: string
  ): Promise<T> {
    try {
      const instance = await this.findOne({
        where: { email } as unknown as WhereOptions<T["_attributes"]>,
        include: [{ association: "role" }],
      });

      if (!instance) {
        throw new Error(`Aucun compte associé à l'adresse e-mail : ${email}`);
      }

      return instance;
    } catch (err) {
      const message = `[${this.name}] findByEmail → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Soft-delete d'un compte à partir de son identifiant.
   */
  static async deleteSoft<T extends Model>(
    this: ModelStatic<T>,
    id: string
  ): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { deleted_at: new Date(), status: "deleted" },
        {
          where: { id } as unknown as WhereOptions<T["_attributes"]>,
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
      }] deleteSoft → Suppression partielle du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Suspend un compte en définissant la date de suspension et le statut.
   */
  static async suspend<T extends Model>(
    this: ModelStatic<T>,
    id: string
  ): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { suspended_at: new Date(), status: "suspended" },
        {
          where: { id } as unknown as WhereOptions<T["_attributes"]>,
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
      }] suspend → Suspension du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Réactive un compte en réinitialisant les champs de suspension et de suppression.
   */
  static async reactivate<T extends Model>(
    this: ModelStatic<T>,
    id: string
  ): Promise<number> {
    try {
      const [affectedRows] = await this.update(
        { suspended_at: null, deleted_at: null, status: "active" },
        {
          where: { id } as unknown as WhereOptions<T["_attributes"]>,
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
      }] reactivate → Réactivation du compte impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  // === Méthodes d'instance ===

  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  async updateLastLogin() {
    this.last_login = new Date();
    await this.save();
  }

  toSafeObject() {
    const { password, ...safeData } = this.get();
    return safeData;
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
