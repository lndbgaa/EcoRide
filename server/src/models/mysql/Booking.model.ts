import { DataTypes, Model } from "sequelize";

import { BOOKING_ERROR_MESSAGES, BOOKING_STATUSES } from "@/constants";
import { AppError, formatDateTimeFromUTC } from "@/utils";

import type { Trip, User } from "@/models/mysql";
import type { BookingAdminDTO, BookingPassengerDTO, BookingPublicDTO, BookingStatus } from "@/types";
import type { TFunction } from "i18next";
import type { SaveOptions, Sequelize } from "sequelize";

const { CONFIRMED, AWAITING_FEEDBACK, COMPLETED, CANCELLED } = BOOKING_STATUSES;

export default class Booking extends Model {
  declare id: string;
  declare trip_id: string;
  declare passenger_id: string;
  declare seats_booked: number;
  declare status: BookingStatus;
  declare created_at: Date;
  declare updated_at: Date;

  declare trip?: Trip;
  declare passenger?: User;

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isConfirmed(): boolean {
    return this.status === CONFIRMED;
  }

  public isAwaitingFeedback(): boolean {
    return this.status === AWAITING_FEEDBACK;
  }

  public isCompleted(): boolean {
    return this.status === COMPLETED;
  }

  public isCancelled(): boolean {
    return this.status === CANCELLED;
  }

  // ----------------------------
  // Private Status Transitions
  // ----------------------------

  private static readonly allowedStatusTransitions: Record<BookingStatus, BookingStatus[]> = {
    confirmed: [CANCELLED, AWAITING_FEEDBACK],
    awaiting_feedback: [COMPLETED],
    completed: [],
    cancelled: [],
  } as const;

  private canTransitionTo(newStatus: BookingStatus): boolean {
    return Booking.allowedStatusTransitions[this.status]?.includes(newStatus) ?? false;
  }

  private transitionTo(newStatus: BookingStatus): void {
    if (this.status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: BOOKING_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        debugMessage: `Booking ${this.id} cannot transition from ${this.status} to ${newStatus}.`,
      });
    }

    this.status = newStatus;
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsCancelled(options?: SaveOptions): Promise<void> {
    this.transitionTo(CANCELLED);
    await this.save({ ...options, fields: ["status"] });
  }

  public async markAsAwaitingFeedback(options?: SaveOptions): Promise<void> {
    this.transitionTo(AWAITING_FEEDBACK);
    await this.save({ ...options, fields: ["status"] });
  }

  public async markAsCompleted(options?: SaveOptions): Promise<void> {
    this.transitionTo(COMPLETED);
    await this.save({ ...options, fields: ["status"] });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(): BookingPublicDTO {
    return {
      id: this.id,
      passenger: this.passenger?.toPublicDTO() ?? null,
      seatsBooked: this.seats_booked,
    };
  }

  public toPassengerDTO(t: TFunction): BookingPassengerDTO {
    return {
      id: this.id,
      trip: this.trip?.toPublicDTO(t) ?? null,
      seatsBooked: this.seats_booked,
      status: this.status,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public toAdminDTO(t: TFunction): BookingAdminDTO {
    return {
      id: this.id,
      trip: this.trip?.toAdminDTO(t) ?? null,
      passenger: this.passenger?.toAdminDTO(t) ?? null,
      seatsBooked: this.seats_booked,
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
        trip_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "trips", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        passenger_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        seats_booked: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [1],
              msg: `Seats booked must be at least 1.`,
            },
            isInt: { msg: "Seats booked must be an integer." },
          },
        },
        status: {
          type: DataTypes.ENUM(...Object.values(BOOKING_STATUSES)),
          allowNull: false,
          defaultValue: CONFIRMED,
        },
      },
      {
        sequelize,
        modelName: "Booking",
        tableName: "bookings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  }
}
