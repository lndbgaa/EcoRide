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
 * Fournit des méthodes utilitaires nota pour effectuer des opérations CRUD simples.
 *
 * ⚠️ Ne doit pas être instanciée directement.
 */
class Base extends Model {
  /**
   * Récupère tous les enregistrements correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options Sequelize supplémentaires (inclure des relations, etc.).
   * @returns Une liste d’instances.
   */
  static async findAllByField<T extends Model>(
    this: ModelStatic<T>,
    field: string,
    value: any,
    options: FindOptions<T> = {}
  ): Promise<T[]> {
    if (typeof field !== "string") {
      throw new Error(
        `[${this.name}] findAllByField → Le champ doit être une chaîne de caractères.`
      );
    }

    try {
      const mergedWhere: FindOptions<T>["where"] = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, include, ...otherOptions } = options;

      const instances = await this.findAll({
        ...otherOptions,
        where: mergedWhere,
        include: options.include ?? [],
      });

      return instances ?? [];
    } catch (err) {
      const message = `[${this.name}] findAllByField (${field}) → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Récupère un seul enregistrement correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options de recherche Sequelize.
   * @returns L’instance trouvée ou `null`.
   */
  static async findOneByField<T extends Model>(
    this: ModelStatic<T>,
    field: string,
    value: any,
    options: FindOptions<T> = {}
  ): Promise<T | null> {
    if (typeof field !== "string") {
      throw new Error(
        `[${this.name}] findOneByField → Le champ doit être une chaîne de caractères.`
      );
    }

    try {
      const mergedWhere: FindOptions<T>["where"] = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, include, ...otherOptions } = options;

      const instance = await this.findOne({
        ...otherOptions,
        where: mergedWhere,
        include: options.include ?? [],
      });
      return instance ?? null;
    } catch (err) {
      const message = `[${this.name}] findOneByField (${field}) → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   *  Récupère un enregistrement en fonction de son id.
   *
   * @param id - Identifiant de l'enregistrement.
   * @param options - Options de recherche Sequelize.
   * @returns L’instance trouvée ou `null`.
   */
  static async findById<T extends Model>(
    this: ModelStatic<T>,
    id: string | number,
    options: FindOptions<T> = {}
  ): Promise<T | null> {
    try {
      const instance = await this.findByPk(id, options);
      return instance ?? null;
    } catch (err) {
      const message = `[${this.name}] findById (${id}) → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Crée une nouvelle entrée dans la base de données.
   *
   * @param data - Les données à insérer.
   * @param options - Options de création Sequelize.
   * @returns L’instance créée.
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
   * Met à jour un enregistrement à partir de son identifiant.
   *
   * @param id - Identifiant de l'enregistrement.
   * @param data - Données à mettre à jour.
   * @param options - Options de mise à jour Sequelize.
   * @returns Le nombre de lignes modifiées (1 si ok, sinon 0).
   */
  static async updateOne<T extends Model>(
    this: ModelStatic<T>,
    id: string | number,
    data: Partial<Attributes<T>>,
    options: Omit<UpdateOptions<Attributes<T>>, "where"> = {}
  ): Promise<number> {
    try {
      const [affectedRows] = await this.update(data, {
        where: { id } as unknown as WhereOptions<T["_attributes"]>,
        individualHooks: true,
        ...options,
      });

      return affectedRows;
    } catch (err) {
      const message = `[${this.name}] updateOne → Mise à jours de l'élément impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Compte tous les enregistrements d'une table.
   *
   * @returns Le nombre total d'enregistrements (0 si aucun).
   */
  static async countAll<T extends Model>(this: ModelStatic<T>): Promise<number> {
    try {
      const count = await this.count();
      return count;
    } catch (err) {
      const message = `[${this.name}] countAll → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  /**
   * Supprime définitivement un enregistrement par son identifiant.
   *
   * @param id - Identifiant de l'enregistrement.
   * @returns Le nombre de lignes supprimées (1 si ok, sinon 0).
   */
  static async deleteHard<T extends Model>(
    this: ModelStatic<T>,
    id: string | number
  ): Promise<number> {
    try {
      const deletedRows = await this.destroy({
        where: { id } as unknown as WhereOptions<T["_attributes"]>,
      });

      return deletedRows;
    } catch (err) {
      const message = `[${
        this.name
      }] deleteHard → Suppression définitive de l'élément impossible : ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }
}

export default Base;
