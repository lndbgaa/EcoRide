import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/config";
import { RIDE_ERROR_MESSAGES, RIDE_MAX_PRICE, RIDE_MIN_PRICE, RIDE_STATUSES } from "@/constants";
import { AppError, calculateDuration, formatDateTime, toDateOnly, toTimeOnly } from "@/utils";

import type { User, Vehicle } from "@/models/mysql";
import type { RideAdminDTO, RidePrivateDTO, RidePublicDTO, RideStatus } from "@/types";
import type { SaveOptions, Sequelize } from "sequelize";

const { OPEN, FULL, IN_PROGRESS, COMPLETED, CANCELLED } = RIDE_STATUSES;

export default class Ride extends Model {
  declare id: string;
  declare departure_datetime: Date;
  declare departure_location: string;
  declare arrival_datetime: Date;
  declare arrival_location: string;
  declare driver_id: string;
  declare vehicle_id: string;
  declare price: number;
  declare offered_seats: number;
  declare available_seats: number;
  declare status: RideStatus;
  declare created_at: Date;
  declare updated_at: Date;

  declare driver?: User;
  declare vehicle?: Vehicle;

  // ----------------------------
  // Getters
  // ----------------------------

  public get duration(): number | null {
    return calculateDuration(this.departure_datetime, this.arrival_datetime);
  }

  public get isEcoFriendly(): boolean {
    return this.vehicle?.isEcoVehicle ?? false;
  }

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isOpen(): boolean {
    return this.status === OPEN;
  }

  public isFull(): boolean {
    return this.status === FULL;
  }

  public isInProgress(): boolean {
    return this.status === IN_PROGRESS;
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

  private static readonly allowedStatusTransitions: Record<RideStatus, RideStatus[]> = {
    open: [FULL, IN_PROGRESS, CANCELLED],
    full: [OPEN, IN_PROGRESS, CANCELLED],
    in_progress: [COMPLETED],
    completed: [],
    cancelled: [],
  } as const;

  private canTransitionTo(newStatus: RideStatus): boolean {
    return Ride.allowedStatusTransitions[this.status]?.includes(newStatus) ?? false;
  }

  private transitionTo(newStatus: RideStatus): void {
    if (this.status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: RIDE_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        debugMessage: `Ride ${this.id} cannot transition from ${this.status} to ${newStatus}`,
      });
    }

    this.status = newStatus;
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  private async markAsOpen(options?: SaveOptions): Promise<void> {
    this.transitionTo(OPEN);
    await this.save({ ...options, fields: ["status"] });
  }

  private async markAsFull(options?: SaveOptions): Promise<void> {
    this.transitionTo(FULL);
    await this.save({ ...options, fields: ["status"] });
  }

  public async markAsInProgress(options?: SaveOptions): Promise<void> {
    this.transitionTo(IN_PROGRESS);
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
  // Business Logic
  // ----------------------------

  public async addAvailableSeats(amount: number, options?: SaveOptions): Promise<void> {
    const canAddSeats = this.isOpen() || this.isFull();

    if (!canAddSeats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: RIDE_ERROR_MESSAGES.CANNOT_MODIFY_SEATS,
        debugMessage: `Cannot add seats: Ride status is "${this.status}". Only OPEN or FULL rides can have seats added.`,
      });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: RIDE_ERROR_MESSAGES.INVALID_SEAT_AMOUNT,
        debugMessage: `Invalid add amount: ${amount}. Must be a positive integer.`,
      });
    }

    return sequelize.transaction(async (t) => {
      await this.reload({ transaction: t });

      if (this.available_seats + amount > this.offered_seats) {
        throw new AppError({
          statusCode: 400,
          userMessageKey: RIDE_ERROR_MESSAGES.EXCEEDS_OFFERED_SEATS,
          debugMessage: `Adding ${amount} seats would exceed offered seats. Available: ${this.available_seats}, Offered: ${this.offered_seats}.`,
        });
      }

      this.available_seats += amount;

      if (this.isFull() && this.available_seats > 0) {
        await this.markAsOpen({ ...options, transaction: t });
      }

      await this.save({
        ...options,
        transaction: t,
        fields: ["available_seats"],
      });
    });
  }

  public async removeAvailableSeats(amount: number, options?: SaveOptions): Promise<void> {
    const canRemoveSeats = this.isOpen();

    if (!canRemoveSeats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: RIDE_ERROR_MESSAGES.CANNOT_MODIFY_SEATS,
        debugMessage: `Cannot remove seats: Ride ${this.id} status is "${this.status}". Only OPEN rides can have seats removed.`,
      });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: RIDE_ERROR_MESSAGES.INVALID_SEAT_AMOUNT,
        debugMessage: `Invalid remove amount: ${amount}. Must be a positive integer.`,
      });
    }

    return sequelize.transaction(async (t) => {
      await this.reload({ transaction: t });

      if (amount > this.available_seats) {
        throw new AppError({
          statusCode: 400,
          userMessageKey: RIDE_ERROR_MESSAGES.NOT_ENOUGH_AVAILABLE_SEATS,
          debugMessage: `Cannot remove ${amount} seats for ride ${this.id}. Only ${this.available_seats} seats are available.`,
        });
      }

      this.available_seats -= amount;

      if (this.available_seats === 0) {
        await this.markAsFull({ ...options, transaction: t });
      }

      await this.save({
        ...options,
        transaction: t,
        fields: ["available_seats"],
      });
    });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(): RidePublicDTO {
    return {
      id: this.id,
      departureDate: toDateOnly(this.departure_datetime),
      departureTime: toTimeOnly(this.departure_datetime),
      departureLocation: this.departure_location,
      arrivalDate: toDateOnly(this.arrival_datetime),
      arrivalTime: toTimeOnly(this.arrival_datetime),
      arrivalLocation: this.arrival_location,
      duration: this.duration,
      price: this.price,
      isEcoFriendly: this.isEcoFriendly,
      availableSeats: this.available_seats,
      offeredSeats: this.offered_seats,
      driver: this.driver?.toPublicDTO() ?? null,
      vehicle: this.vehicle?.toPublicDTO() ?? null,
      status: this.status,
      createdAt: formatDateTime(this.created_at),
    };
  }

  public toPrivateDTO(): RidePrivateDTO {
    return {
      ...this.toPublicDTO(),
      driver: null,
      vehicle: this.vehicle?.toPrivateDTO() ?? null,
    };
  }

  public toAdminDTO(): RideAdminDTO {
    return {
      ...this.toPrivateDTO(),
      driver: this.driver?.toAdminDTO() ?? null,
      vehicle: this.vehicle?.toAdminDTO() ?? null,
    };
  }

  // ----------------------------
  // Model Initialisation
  // ----------------------------

  public static initModel(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        departure_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        departure_location: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: { notEmpty: { msg: "Departure location is required." } },
        },
        arrival_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        arrival_location: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: { notEmpty: { msg: "Arrival location is required." } },
        },
        driver_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        vehicle_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "vehicles", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [RIDE_MIN_PRICE],
              msg: `Price must be at least ${RIDE_MIN_PRICE} credits.`,
            },
            max: {
              args: [RIDE_MAX_PRICE],
              msg: `Price cannot exceed ${RIDE_MAX_PRICE} credits.`,
            },
          },
        },
        offered_seats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [1],
              msg: `Offered seats must be at least 1.`,
            },
          },
        },
        available_seats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(RIDE_STATUSES)),
          allowNull: false,
          defaultValue: OPEN,
        },
      },
      {
        sequelize,
        modelName: "Ride",
        tableName: "rides",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        hooks: {
          beforeCreate: (ride: Ride) => {
            ride.departure_location = ride.departure_location.trim();
            ride.arrival_location = ride.arrival_location.trim();
            ride.available_seats = ride.offered_seats;
          },
        },
      }
    );
  }
}
