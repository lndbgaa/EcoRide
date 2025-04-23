import { Model } from "sequelize";

import type {
  CreateOptions,
  DestroyOptions,
  FindOptions,
  ModelStatic,
  UpdateOptions,
  WhereOptions,
} from "sequelize";

import config from "@/config/app.config.js";

const { env } = config.server;

/**
 * Classe de base générique pour les modèles Sequelize.
 *
 * Fournit des méthodes utilitaires notamment pour effectuer des opérations CRUD simples.
 *
 * ⚠️ Ne doit pas être instanciée directement.
 */
abstract class Base extends Model {
  /**
   * Récupère tous les enregistrements d'une table correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options de recherche Sequelize.
   * @returns Une liste d'instances.
   */
  static async findAllByField<T extends Model>(
    this: ModelStatic<T>,
    field: keyof T["_attributes"],
    value: any,
    options: FindOptions<T> = {}
  ): Promise<T[]> {
    try {
      const mergedWhere: FindOptions<T>["where"] = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, include, ...otherOptions } = options;

      const instances = await this.findAll({
        where: mergedWhere,
        include: options.include ?? [],
        ...otherOptions,
      });

      return instances ?? [];
    } catch (err) {
      if (env === "production") {
        throw new Error("Une erreur est survenue lors de la récupération des enregistrements.");
      } else {
        throw new Error(
          `[${this.name}] findAllByField (${String(field)}) : (${String(value)}) → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  /**
   * Récupère un seul enregistrement d'une table correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options de recherche Sequelize.
   * @returns L'instance trouvée ou `null`.
   */
  static async findOneByField<T extends Model>(
    this: ModelStatic<T>,
    field: keyof T["_attributes"],
    value: any,
    options: FindOptions<T> = {}
  ): Promise<T | null> {
    try {
      const mergedWhere: FindOptions<T>["where"] = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, include, ...otherOptions } = options;

      const instance = await this.findOne({
        where: mergedWhere,
        include: options.include ?? [],
        ...otherOptions,
      });
      return instance ?? null;
    } catch (err) {
      if (env === "production") {
        throw new Error("Une erreur est survenue lors de la récupération de l'enregistrement.");
      } else {
        throw new Error(
          `[${this.name}] findOneByField (${String(field)}) : (${String(value)}) → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  /**
   * Crée une nouvelle entrée dans une table.
   *
   * @param data - Les données à insérer.
   * @param options - Options de création Sequelize.
   * @returns L'instance créée.
   */
  static async createOne<T extends Model>(
    this: ModelStatic<T>,
    data: T["_creationAttributes"],
    options: CreateOptions<T> = {}
  ): Promise<T> {
    try {
      const instance = await this.create(data, options);
      return instance;
    } catch (err) {
      if (env === "production") {
        throw new Error("Une erreur est survenue lors de la création de l'enregistrement.");
      } else {
        throw new Error(
          `[${this.name}] createOne → Données : ${JSON.stringify(data)} → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  /**
   * Met à jour un ou plusieurs enregistrements d'une table correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param data - Données à mettre à jour.
   * @param options - Options de mise à jour Sequelize.
   * @returns Le nombre de lignes modifiées (1 si ok, sinon 0).
   */
  static async updateByField<T extends Model>(
    this: ModelStatic<T>,
    field: keyof T["_attributes"],
    value: any,
    data: Partial<T["_attributes"]>,
    options: Omit<UpdateOptions<T>, "where"> & { where?: WhereOptions<T> } = {} // TODO: à revoir
  ): Promise<number> {
    try {
      const mergedWhere: WhereOptions<T> = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, ...otherOptions } = options;

      const [affectedRows] = await this.update(data, {
        where: mergedWhere,
        individualHooks: true,
        ...otherOptions,
      });

      return affectedRows;
    } catch (err) {
      if (env === "production") {
        throw new Error("Une erreur est survenue lors de la mise à jour de l'enregistrement.");
      } else {
        throw new Error(
          `[${this.name}] updateOne → Données : ${JSON.stringify(data)} → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  /**
   * Compte tous les enregistrements d'une table
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options de recherche Sequelize.
   * @returns Le nombre total d'enregistrements (0 si aucun).
   */
  static async countAllByField<T extends Model>(
    this: ModelStatic<T>,
    field: keyof T["_attributes"],
    value: any,
    options: FindOptions<T> = {}
  ): Promise<number> {
    try {
      const mergedWhere: FindOptions<T>["where"] = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, include, ...otherOptions } = options;

      const count = await this.count({
        where: mergedWhere,
        include: options.include ?? [],
        ...otherOptions,
      });
      return count;
    } catch (err) {
      if (env === "production") {
        throw new Error(
          "Une erreur est survenue lors de la récupération du nombre d'enregistrements."
        );
      } else {
        throw new Error(
          `[${this.name}] countAllByField (${String(field)}) : (${String(value)}) → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  /**
   * Supprime définitivement un enregistrement d'une table correspondant à un champ donné.
   *
   * @param field - Le nom du champ à filtrer.
   * @param value - La valeur recherchée pour ce champ.
   * @param options - Options de suppression Sequelize.
   * @returns Le nombre de lignes supprimées (1 si ok, sinon 0).
   */
  static async deleteHardByField<T extends Model>(
    this: ModelStatic<T>,
    field: keyof T["_attributes"],
    value: any,
    options: DestroyOptions<T> = {}
  ): Promise<number> {
    try {
      const mergedWhere: WhereOptions<T> = {
        [field]: value,
        ...(options.where ?? {}),
      };

      const { where, ...otherOptions } = options;

      const deletedRows = await this.destroy({
        where: mergedWhere,
        ...otherOptions,
      });

      return deletedRows;
    } catch (err) {
      if (env === "production") {
        throw new Error(
          "Une erreur est survenue lors de la suppression définitive de l'enregistrement."
        );
      } else {
        throw new Error(
          `[${this.name}] deleteHardByField (${String(field)}) : (${String(value)}) → ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }
}

export default Base;
