import { DataTypes, Model } from "sequelize";

import { TRIP_ERROR_MESSAGES, TRIP_MAX_PRICE, TRIP_MIN_PRICE, TRIP_STATUSES } from "@/constants";
import { AppError, calculateDuration, formatDateTimeFromUTC } from "@/utils";

import type { Booking, User, Vehicle } from "@/models/mysql";
import type { TripAdminDTO, TripPrivateDTO, TripPublicDTO, TripStatus } from "@/types";
import type { TFunction } from "i18next";
import type { SaveOptions, Sequelize } from "sequelize";

const { OPEN, FULL, IN_PROGRESS, COMPLETED, CANCELLED } = TRIP_STATUSES;

export default class Trip extends Model {
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
  declare duration_minutes: number;
  declare status: TripStatus;
  declare created_at: Date;
  declare updated_at: Date;

  declare driver?: User;
  declare vehicle?: Vehicle;
  declare bookings?: Booking[];

  // ----------------------------
  // Getters
  // ----------------------------

  public get isEcoFriendly(): boolean {
    return this.vehicle?.isEco ?? false;
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

  private static readonly allowedStatusTransitions: Record<TripStatus, TripStatus[]> = {
    open: [FULL, IN_PROGRESS, CANCELLED],
    full: [OPEN, IN_PROGRESS, CANCELLED],
    in_progress: [COMPLETED],
    completed: [],
    cancelled: [],
  } as const;

  private canTransitionTo(newStatus: TripStatus): boolean {
    return Trip.allowedStatusTransitions[this.status]?.includes(newStatus) ?? false;
  }

  private transitionTo(newStatus: TripStatus): void {
    if (this.status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.INVALID_STATUS_TRANSITION,
        debugMessage: `Cannot transition from ${this.status} to ${newStatus}.`,
      });
    }

    this.setDataValue("status", newStatus);
  }

  // ----------------------------
  // Public Status Transitions
  // ----------------------------

  public async markAsCancelled(options?: SaveOptions): Promise<void> {
    this.transitionTo(CANCELLED);
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

  // ----------------------------
  // Business Logic
  // ----------------------------

  /**
   *
   * @param {number} amount - The number of seats to add.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<void>}
   * @throws {AppError} -If:
   *   - The amount is not a positive integer (HTTP 400).
   *   - Trip status is not OPEN or FULL (HTTP 409).
   *   - Adding the seats would exceed the total offered seats (HTTP 400).
   */
  public async addAvailableSeats(amount: number, options?: SaveOptions): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.INVALID_SEAT_AMOUNT,
        debugMessage: `Invalid add amount: ${amount}. Must be a positive integer.`,
      });
    }

    if (!this.isOpen() && !this.isFull()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.CANNOT_MODIFY_SEATS,
        debugMessage: `Cannot add seats: Trip status is "${this.status}". Only OPEN or FULL trips can have seats added.`,
      });
    }

    if (this.available_seats + amount > this.offered_seats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.EXCEEDS_OFFERED_SEATS,
        debugMessage: `Adding ${amount} seats would exceed offered seats. Available: ${this.available_seats}, Offered: ${this.offered_seats}.`,
      });
    }

    this.available_seats += amount;

    if (this.isFull() && this.available_seats > 0) {
      this.transitionTo(OPEN);
    }

    await this.save({ ...options, fields: ["available_seats", "status"] });
  }

  /**
   *
   * @param {number} amount - The number of seats to remove.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<void>}
   * @throws {AppError} -If:
   *   - The amount is not a positive integer (HTTP 400).
   *   - Trip status is not OPEN (HTTP 409).
   *   - Removing the seats would leave negative available seats (HTTP 400).
   */
  public async removeAvailableSeats(amount: number, options?: SaveOptions): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.INVALID_SEAT_AMOUNT,
        debugMessage: `Invalid remove amount: ${amount}. Must be a positive integer.`,
      });
    }

    if (!this.isOpen()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.CANNOT_MODIFY_SEATS,
        debugMessage: `Cannot remove seats: Trip ${this.id} status is "${this.status}". Only OPEN trips can have seats removed.`,
      });
    }

    if (amount > this.available_seats) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: TRIP_ERROR_MESSAGES.GENERIC.NOT_ENOUGH_AVAILABLE_SEATS,
        debugMessage: `Cannot remove ${amount} seats for trip ${this.id}. Only ${this.available_seats} seats are available.`,
      });
    }

    this.available_seats -= amount;

    if (this.available_seats === 0) {
      this.transitionTo(FULL);
    }

    await this.save({ ...options, fields: ["available_seats", "status"] });
  }

  // ----------------------------
  // DTOs
  // ----------------------------

  public toPublicDTO(t: TFunction): TripPublicDTO {
    const departure = formatDateTimeFromUTC(this.departure_datetime);
    const arrival = formatDateTimeFromUTC(this.arrival_datetime);

    return {
      id: this.id,
      departureDate: departure.date,
      departureTime: departure.time,
      departureLocation: this.departure_location,
      arrivalDate: arrival.date,
      arrivalTime: arrival.time,
      arrivalLocation: this.arrival_location,
      duration: this.duration_minutes,
      price: this.price,
      isEcoFriendly: this.isEcoFriendly,
      availableSeats: this.available_seats,
      offeredSeats: this.offered_seats,
      driver: this.driver?.toPublicDTO() ?? null,
      vehicle: this.vehicle?.toPublicDTO(t) ?? null,
      status: this.status,
    };
  }

  public toPrivateDTO(t: TFunction): TripPrivateDTO {
    const departure = formatDateTimeFromUTC(this.departure_datetime);
    const arrival = formatDateTimeFromUTC(this.arrival_datetime);

    return {
      id: this.id,
      departureDate: departure.date,
      departureTime: departure.time,
      departureLocation: this.departure_location,
      arrivalDate: arrival.date,
      arrivalTime: arrival.time,
      arrivalLocation: this.arrival_location,
      duration: this.duration_minutes,
      price: this.price,
      isEcoFriendly: this.isEcoFriendly,
      availableSeats: this.available_seats,
      offeredSeats: this.offered_seats,
      vehicle: this.vehicle?.toPrivateDTO(t) ?? null,
      status: this.status,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public toAdminDTO(t: TFunction): TripAdminDTO {
    return {
      ...this.toPrivateDTO(t),
      driver: this.driver?.toAdminDTO(t) ?? null,
      vehicle: this.vehicle?.toAdminDTO(t) ?? null,
    };
  }

  // ----------------------------
  // Model Initialisation
  // ----------------------------

  public static initModel(sequelize: Sequelize) {
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
          onDelete: "RESTRICT",
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: {
              args: [TRIP_MIN_PRICE],
              msg: `Price must be at least ${TRIP_MIN_PRICE} credits.`,
            },
            max: {
              args: [TRIP_MAX_PRICE],
              msg: `Price cannot exceed ${TRIP_MAX_PRICE} credits.`,
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
        duration_minutes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TRIP_STATUSES)),
          allowNull: false,
          defaultValue: OPEN,
        },
      },
      {
        sequelize,
        modelName: "Trip",
        tableName: "trips",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        hooks: {
          beforeValidate: (trip: Trip) => {
            trip.departure_location = trip.departure_location.trim();
            trip.arrival_location = trip.arrival_location.trim();
          },

          beforeCreate: (trip: Trip) => {
            trip.duration_minutes = calculateDuration(
              trip.departure_datetime,
              trip.arrival_datetime
            );

            trip.available_seats = trip.offered_seats;
          },
        },
      }
    );
  }
}
