import { sequelize } from "@/config/mysql.js";
import { DataTypes, UUIDV4 } from "sequelize";
import Base from "./Base.model.js";
import type Employee from "./Employee.model.js";
import type Ride from "./Ride.model.js";
import type User from "./User.model.js";

type ReviewStatus = "pending" | "approved" | "rejected";

class Review extends Base {
  declare id: string;
  declare rating: number;
  declare comment: string;
  declare author_id?: string | null;
  declare target_id?: string | null;
  declare ride_id?: string | null;
  declare status: ReviewStatus;
  declare moderator_id?: string | null;
  declare created_at?: Date;
  declare updated_at?: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare author?: User;
  declare target?: User;
  declare ride?: Ride;
  declare moderator?: Employee;

  // Récupère les avis laissés par un utilisateur donné.
  static async findByAuthor(authorId: string): Promise<Review[]> {
    try {
      const reviews = await this.findAll({
        where: { author_id: authorId },
        include: [
          { association: "target" }, // Pour savoir qui est évalué
          { association: "ride" }, // Pour le contexte du trajet
        ],
      });

      return reviews;
    } catch (err) {
      const message = `[${this.name}] findByAuthor → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  // Récupère les avis obtenus par un utilisateur donné.
  static async findByTarget(targetId: string): Promise<Review[]> {
    try {
      const reviews = await this.findAll({
        where: { target_id: targetId },
        include: [
          { association: "author" }, // Pour savoir qui a écrit l'avis
          { association: "ride" }, // Pour le contexte du trajet
        ],
      });

      return reviews;
    } catch (err) {
      const message = `[${this.name}] findByTarget → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
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
      type: DataTypes.ENUM("pending", "approved", "rejected"),
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
