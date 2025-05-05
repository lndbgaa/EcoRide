import { DataTypes, Model, UUIDV4 } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import AppError from "@/utils/AppError.js";
import { toDateOnly } from "@/utils/date.utils.js";
import { Ride, User } from "./index.js";

import type { BookingStatus } from "@/types/index.js";
import type { SaveOptions } from "sequelize";
import type { RidePublicPreviewDTO } from "./Ride.model.js";
import type { UserPublicDTO } from "./User.model.js";

export interface BookingPublicDTO {
  id: string;
  passenger: UserPublicDTO | null;
  seatsBooked: number;
}

export interface BookingPrivateDTO {
  id: string;
  ride: RidePublicPreviewDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: string;
}

/**
 * Modèle représentant une réservation de la plateforme.
 *
 * @extends Base
 */
class Booking extends Model {
  declare id: string;
  declare ride_id: string;
  declare passenger_id: string;
  declare seats_booked: number;
  declare status: BookingStatus;
  declare created_at: Date;
  declare updated_at: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare ride?: Ride;
  declare passenger?: User;

  /**
   * Liste des transitions autorisées entre les statuts d'une réservation.
   */
  private static readonly allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    confirmed: ["awaiting_feedback", "cancelled"],
    awaiting_feedback: ["completed"],
    completed: [],
    cancelled: [],
  } as const;

  /**
   * Vérifie si une transition vers un nouveau statut est autorisée.
   * @param status - Le nouveau statut à vérifier.
   * @returns `true` si la transition est autorisée, `false` sinon.
   */
  private canTransitionTo(status: BookingStatus): boolean {
    const currentStatus: BookingStatus = this.status;
    return Booking.allowedTransitions[currentStatus]?.includes(status) ?? false;
  }

  /**
   * Applique une transition vers un nouveau statut, si elle est autorisée.
   * @param status - Le nouveau statut à appliquer.
   * @param options - Options de sauvegarde sequelize.
   */
  private async transitionTo(status: BookingStatus, options?: SaveOptions): Promise<void> {
    if (!this.canTransitionTo(status)) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Transition de "${this.status}" vers "${status}" non autorisée.`,
      });
    }

    this.status = status;
    await this.save(options);
  }

  public toPublicDTO(): BookingPublicDTO {
    return {
      id: this.id,
      passenger: this.passenger?.toPublicDTO() ?? null,
      seatsBooked: this.seats_booked,
    };
  }

  public toPrivateDTO(): BookingPrivateDTO {
    return {
      id: this.id,
      ride: this.ride?.toPublicPreviewDTO() ?? null,
      seatsBooked: this.seats_booked,
      status: this.status,
      createdAt: toDateOnly(this.created_at),
    };
  }

  public async markAsAwaitingFeedback(options?: SaveOptions): Promise<void> {
    await this.transitionTo("awaiting_feedback", options);
  }

  public async markAsCompleted(options?: SaveOptions): Promise<void> {
    await this.transitionTo("completed", options);
  }

  public async markAsCancelled(options?: SaveOptions): Promise<void> {
    await this.transitionTo("cancelled", options);
  }

  public getId(): string {
    return this.id;
  }

  public getRideId(): string {
    return this.ride_id;
  }

  public getPassengerId(): string {
    return this.passenger_id;
  }

  public getSeatsBooked(): number {
    return this.seats_booked;
  }

  public getPassenger(): User | null {
    return this.passenger ?? null;
  }

  public getStatus(): BookingStatus {
    return this.status;
  }

  public isConfirmed(): boolean {
    return this.status === "confirmed";
  }

  public isAwaitingFeedback(): boolean {
    return this.status === "awaiting_feedback";
  }

  public isCompleted(): boolean {
    return this.status === "completed";
  }

  public isCancelled(): boolean {
    return this.status === "cancelled";
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
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
    passenger_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "accounts",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    seats_booked: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Le nombre de places réservées doit être supérieur à 0.",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(
        ...(["confirmed", "awaiting_feedback", "completed", "cancelled"] as BookingStatus[])
      ),
      defaultValue: "confirmed",
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

export default Booking;
