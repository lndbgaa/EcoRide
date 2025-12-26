import { DataTypes, Model } from "sequelize";

import {
  REVIEW_ERROR_MESSAGES,
  REVIEW_MAX_RATING,
  REVIEW_MIN_RATING,
  REVIEW_STATUSES,
} from "@/constants";
import { AppError, formatDateTimeFromUTC } from "@/utils";

import type { Trip, User } from "@/models/mysql";
import type {
  ReviewAdminDTO,
  ReviewAuthorDTO,
  ReviewPublicDTO,
  ReviewStatus,
} from "@/types";
import type { TFunction } from "i18next";
import type { SaveOptions, Sequelize } from "sequelize";

const { PENDING, APPROVED, REJECTED } = REVIEW_STATUSES;

export default class Review extends Model {
  declare id: string;
  declare rating: number;
  declare comment: string | null;
  declare author_id: string;
  declare target_id: string;
  declare trip_id: string;
  declare status: ReviewStatus;
  declare moderator_id: string | null;
  declare created_at: Date;
  declare updated_at: Date;

  declare author?: User;
  declare target?: User;
  declare trip: Trip;
  declare moderator?: User;

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isPending(): boolean {
    return this.status === PENDING;
  }

  public isApproved(): boolean {
    return this.status === APPROVED;
  }

  public isRejected(): boolean {
    return this.status === REJECTED;
  }

  // ----------------------------
  // Private Status Transitions
  // ----------------------------

  private static readonly allowedStatusTransitions: Record<
    ReviewStatus,
    ReviewStatus[]
  > = {
    pending: [APPROVED, REJECTED],
    approved: [],
    rejected: [],
  } as const;

  private canTransitionTo(newStatus: ReviewStatus): boolean {
    return (
      Review.allowedStatusTransitions[this.status]?.includes(newStatus) ??
      false
    );
  }

  private transitionTo(newStatus: ReviewStatus): void {
    if (this.status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: REVIEW_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        debugMessage: `Review ${this.id} cannot transition from ${this.status} to ${newStatus}.`,
      });
    }

    this.status = newStatus;
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsApproved(
    moderatorId: string,
    options?: SaveOptions
  ): Promise<void> {
    this.transitionTo(APPROVED);
    this.moderator_id = moderatorId;
    await this.save({ ...options, fields: ["status", "moderator_id"] });
  }

  public async markAsRejected(
    moderatorId: string,
    options?: SaveOptions
  ): Promise<void> {
    this.transitionTo(REJECTED);
    this.moderator_id = moderatorId;
    await this.save({ ...options, fields: ["status", "moderator_id"] });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(): ReviewPublicDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toPublicDTO() ?? null,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public toAuthorDTO(): ReviewAuthorDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      target: this.target?.toPublicDTO() ?? null,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public toAdminDTO(t: TFunction): ReviewAdminDTO {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      author: this.author?.toAdminDTO(t) ?? null,
      target: this.target?.toAdminDTO(t) ?? null,
      trip: this.trip?.toAdminDTO(t) ?? null,
      status: this.status,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public static initModel(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            isInt: { msg: "Rating must be an integer." },
            min: {
              args: [REVIEW_MIN_RATING],
              msg: `Rating must be at least ${REVIEW_MIN_RATING}.`,
            },
            max: {
              args: [REVIEW_MAX_RATING],
              msg: `Rating cannot exceed ${REVIEW_MAX_RATING}.`,
            },
          },
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        author_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        target_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        trip_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "trips", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        status: {
          type: DataTypes.ENUM(...Object.values(REVIEW_STATUSES)),
          allowNull: false,
          defaultValue: PENDING,
        },
        moderator_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
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
            name: "unique_reviews_author_target_trip",
            fields: ["author_id", "target_id", "trip_id"],
          },
        ],
      }
    );
  }
}
