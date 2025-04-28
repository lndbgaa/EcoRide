import { DataTypes, UUIDV4 } from "sequelize";

import type { UserPublicDTO } from "./User.model.js";

import { sequelize } from "@/config/mysql.config.js";
import { Base, Ride, User } from "@/models/mysql/";

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

  public getRating(): number {
    return this.rating;
  }

  public getComment(): string {
    return this.comment;
  }

  public getAuthorId(): string | null {
    return this.author_id;
  }

  public getTargetId(): string | null {
    return this.target_id;
  }

  public getRideId(): string | null {
    return this.ride_id;
  }

  public getStatus(): ReviewStatus {
    return this.status;
  }

  public isPending(): boolean {
    return this.status === "pending";
  }

  public isApproved(): boolean {
    return this.status === "approved";
  }

  public isRejected(): boolean {
    return this.status === "rejected";
  }

  public getModeratorId(): string | null {
    return this.moderator_id;
  }

  /**
   * Renvoie la version "public" d'un avis.
   */
  public toPublicDTO(): ReviewPublicDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toPublicDTO() ?? null,
    };
  }

  /**
   * Renvoie la version "privée" d'un avis.
   */
  public toPrivateDTO(): ReviewPrivateDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      target: this.target?.toPublicDTO() ?? null,
    };
  }

  /**
   * Renvoie la version "administrative" d'un avis.
   */
  public toAdminDTO(): ReviewAdminDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toPublicDTO() ?? null,
      target: this.target?.toPublicDTO() ?? null,
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
