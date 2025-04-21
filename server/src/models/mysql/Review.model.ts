import { sequelize } from "@/config/mysql.config.js";
import { DataTypes, UUIDV4 } from "sequelize";
import Base from "./Base.model.js";
import Ride from "./Ride.model.js";
import type { UserPublicDTO } from "./User.model.js";
import User from "./User.model.js";

type ReviewStatus = "pending" | "approved" | "rejected";

interface ReviewPublicDTO {
  id: string;
  rating: number;
  comment: string;
  author: UserPublicDTO | null;
}

interface ReviewPrivateDTO {
  id: string;
  rating: number;
  comment: string;
  target: UserPublicDTO | null;
}

interface ReviewAdminDTO {
  id: string;
  rating: number;
  comment: string;
  author: UserPublicDTO | null;
  target: UserPublicDTO | null;
  status: ReviewStatus;
  created_at: Date;
}

/**
 * Modèle représentant un avis de la plateforme.
 *
 * @extends Base
 */
class Review extends Base {
  declare id: string;
  declare rating: number;
  declare comment: string;
  declare author_id: string | null;
  declare target_id: string | null;
  declare ride_id: string | null;
  declare status: ReviewStatus;
  declare moderator_id: string | null;
  declare created_at: Date;
  declare updated_at: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare author?: User;
  declare target?: User;
  declare ride?: Ride;

  /**
   * Récupère tous les avis rédigés par un utilisateur spécifique.
   */
  static async findAllByAuthor(authorId: string): Promise<Review[]> {
    return await this.findAllByField("author_id", authorId, {
      include: [{ association: "target" }, { association: "ride" }],
    });
  }

  /**
   * Récupère les avis obtenus par un utilisateur donné.
   */
  static async findAllByTarget(targetId: string): Promise<Review[]> {
    return await this.findAllByField("target_id", targetId, {
      include: [{ association: "author" }, { association: "ride" }],
    });
  }

  /**
   *  Modère un avis : change son statut en 'approved' ou 'rejected'.
   */
  async moderate(status: Exclude<ReviewStatus, "pending">, moderatorId: string) {
    if (this.status !== "pending") throw new Error("L'avis a déjà été traité.");

    if (!["approved", "rejected"].includes(status)) {
      throw new Error("Statut invalide pour la modération.");
    }

    this.status = status;
    this.moderator_id = moderatorId;
    await this.save();
  }

  /**
   * Renvoie la version "public" d'un avis.
   *
   * 💡 Utile pour visionner les avis obtenu par un utilisateur (ex : publique ou historique).
   */
  toPublicDTO(): ReviewPublicDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toPublicJSON() ?? null,
    };
  }

  /**
   * Renvoie la version "privée" d'un avis.
   *
   * 💡 Utile pour qu'un utilisateur visionne les avis qu'il a laissé (ex: historique)
   */
  toPrivateDTO(): ReviewPrivateDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      target: this.target?.toPublicJSON() ?? null,
    };
  }

  /**
   * Renvoie la version "administrative" d'un avis.
   *
   * 💡 Utile pour la validation des avis par un employé.
   */
  toAdminDTO(): ReviewAdminDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toPublicJSON() ?? null,
      target: this.target?.toPublicJSON() ?? null,
      status: this.status,
      created_at: this.created_at,
    };
  }
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "La note doit être un entier compris entre 1 et 5.",
        },
        min: {
          args: [1],
          msg: "La note doit être un entier supérieur ou égale à 1.",
        },
        max: {
          args: [5],
          msg: "La note doit être un entier inférieur ou égale à 5.",
        },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    ride_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "rides",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    status: {
      type: DataTypes.ENUM(...(["pending", "approved", "rejected"] as ReviewStatus[])),
      defaultValue: "pending",
    },
    moderator_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["ride_id", "author_id", "target_id"], // Un avis par personne et par course
      },
    ],
  }
);

export default Review;
