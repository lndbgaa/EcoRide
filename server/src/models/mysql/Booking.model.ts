import { DataTypes, Model } from "sequelize";

import { BOOKING_STATUSES, ERROR_MESSAGES } from "@/constants";
import { AppError, formatDateTime } from "@/utils";

import type { Ride, User } from "@/models/mysql";
import type { BookingAdminDTO, BookingDriverDTO, BookingPassengerDTO, BookingPublicDTO, BookingStatus } from "@/types";
import type { SaveOptions, Sequelize } from "sequelize";

const { CONFIRMED, AWAITING_FEEDBACK, COMPLETED, CANCELLED } = BOOKING_STATUSES;

export default class Booking extends Model {
  declare id: string;
  declare ride_id: string;
  declare passenger_id: string;
  declare seats_booked: number;
  declare status: BookingStatus;
  declare created_at: Date;
  declare updated_at: Date;

  declare ride?: Ride;
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
        userMessageKey: ERROR_MESSAGES.BOOKING.INVALID_STATUS_TRANSITION,
        debugMessage: `Booking ${this.id} cannot transition from ${this.status} to ${newStatus}`,
      });
    }

    this.status = newStatus;
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsAwaitingFeedback(options?: SaveOptions): Promise<void> {
    this.transitionTo(AWAITING_FEEDBACK);
    await this.save({ ...options, fields: ["status"] });
  }

  public async markAsCompleted(options?: SaveOptions): Promise<void> {
    this.transitionTo(COMPLETED);
    await this.save({ ...options, fields: ["status"] });
  }

  public async markAsCancelled(options?: SaveOptions): Promise<void> {
    this.transitionTo(CANCELLED);
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

  public toPassengerDTO(): BookingPassengerDTO {
    return {
      id: this.id,
      ride: this.ride?.toPublicDTO() ?? null,
      seatsBooked: this.seats_booked,
      status: this.status,
      createdAt: formatDateTime(this.created_at),
      updatedAt: formatDateTime(this.updated_at),
    };
  }

  public toDriverDTO(): BookingDriverDTO {
    return {
      id: this.id,
      passenger: this.passenger?.toPublicDTO() ?? null,
      seatsBooked: this.seats_booked,
      status: this.status,
      createdAt: formatDateTime(this.created_at),
    };
  }

  public toAdminDTO(): BookingAdminDTO {
    return {
      id: this.id,
      ride: this.ride?.toAdminDTO() ?? null,
      passenger: this.passenger?.toAdminDTO() ?? null,
      seatsBooked: this.seats_booked,
      status: this.status,
      createdAt: formatDateTime(this.created_at),
      updatedAt: formatDateTime(this.updated_at),
    };
  }

  public static initModel(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        ride_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "rides", key: "id" },
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
