import type {
  Attributes,
  CreateOptions,
  FindOptions,
  ModelStatic,
  UpdateOptions,
  WhereOptions,
} from "sequelize";
import { Model } from "sequelize";

/**
 * Classe de base générique pour les modèles Sequelize.
 *
 * Fournit des méthodes utilitaires courantes pour effectuer des opérations CRUD simples.
 *
 * ⚠️ Ne doit pas être instanciée directement.
 */

class Base extends Model {
  /**
   * Récupère tous les éléments de la table dans la BDD.
   */
  static async getAll<T extends Model>(
    this: ModelStatic<T>,
    options: FindOptions = {}
  ): Promise<T[]> {
    try {
      const instances = await this.findAll(options);
      return instances;
    } catch (err) {
      const message = `[${this.name}] findAll →  ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Récupère un élément dans la BDD à partir d'un identifiant.
   */
  static async findById<T extends Model>(
    this: ModelStatic<T>,
    id: string,
    options: FindOptions = {}
  ): Promise<T> {
    try {
      const instance = await this.findOne({ where: { id }, ...options });

      if (!instance) {
        throw new Error(`L'élément avec l'identifiant ${id} est introuvable.`);
      }

      return instance;
    } catch (err) {
      const message = `[${this.name}] findById → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Crée un élément dans la BDD à partir d'un objet de données.
   */
  static async createOne<T extends Model>(
    this: ModelStatic<T>,
    data: T["_creationAttributes"],
    options: CreateOptions<Attributes<T>> = {}
  ): Promise<T> {
    try {
      const instance = await this.create(data, options);
      return instance;
    } catch (err) {
      const message = `[${this.name}] createOne → Création impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   *  Modifie un élément dans la BDD à partir d'un identifiant et d'un objet de données.
   */
  static async updateOne<T extends Model>(
    this: ModelStatic<T>,
    id: string,
    data: Partial<T["_attributes"]>,
    options: Omit<UpdateOptions<Attributes<T>>, "where"> = {}
  ): Promise<number> {
    try {
      const [affectedRows] = await this.update(data, {
        where: { id } as unknown as WhereOptions<T["_attributes"]>,
        individualHooks: true,
        ...options,
      });

      if (affectedRows === 0) {
        throw new Error(
          `L'élément avec l'identifiant ${id} est introuvable ou n'a pas pu être mis à jour.`
        );
      }

      return affectedRows;
    } catch (err) {
      const message = `[${this.name}] updateOne → Mise à jours impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Supprime définitivement un élément de la BDD à partir de son identifiant.
   */
  static async deleteHard<T extends Model>(
    this: ModelStatic<T>,
    id: string
  ): Promise<number> {
    try {
      const deletedRows = await this.destroy({
        where: { id } as unknown as WhereOptions<T["_attributes"]>,
      });

      if (deletedRows === 0) {
        throw new Error(`L'élément avec l'identifiant ${id} est introuvable.`);
      }

      return deletedRows;
    } catch (err) {
      const message = `[${
        this.name
      }] deleteHard → Suppression définitive impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }
}

export default Base;
