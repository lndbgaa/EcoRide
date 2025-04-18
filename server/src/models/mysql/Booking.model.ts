import { sequelize } from "@/config/mysql.js";
import { DataTypes, UUIDV4 } from "sequelize";
import Base from "./Base.model.js";
import type Ride from "./Ride.model.js";
import type User from "./User.model.js";

type BookingStatus = "confirmed" | "completed" | "cancelled";

class Booking extends Base {
  declare id: string;
  declare ride_id: string;
  declare passenger_id: string;
  declare status: BookingStatus;
  declare created_at?: Date;
  declare updated_at?: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé)
  declare ride?: Ride;
  declare passenger?: User;

  // Récupère toutes les réservations faites sur un covoiturage donné.
  static async findByRide(rideId: string): Promise<Booking[]> {
    if (!rideId || typeof rideId !== "string") {
      throw new Error(`[${this.name}] findByRide → ID de covoiturage invalide.`);
    }

    try {
      const bookings = await this.findAll({
        where: { ride_id: rideId },
        include: [{ association: "ride" }, { association: "passenger" }],
      });

      return bookings;
    } catch (err) {
      const message = `[${this.name}] findByRide → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  // Récupère toutes les réservations d'un passager donné.
  static async findByPassenger(passengerId: string): Promise<Booking[]> {
    if (!passengerId || typeof passengerId !== "string") {
      throw new Error(`[${this.name}] findByPassenger → ID de covoiturage invalide.`);
    }

    try {
      const bookings = await this.findAll({
        where: { passenger_id: passengerId },
        include: [{ association: "ride" }, { association: "passenger" }],
      });

      return bookings;
    } catch (err) {
      const message = `[${this.name}] findByPassenger → ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  // Liste des transitions autorisées entre les statuts d'une réservation.
  static readonly allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  // Vérifie si une transition vers un nouveau statut est autorisée.
  canTransitionTo(status: BookingStatus): boolean {
    const currentStatus: BookingStatus = this.status;
    return Booking.allowedTransitions[currentStatus]?.includes(status) ?? false;
  }

  // Applique une transition vers un nouveau statut, si elle est autorisée.
  async transitionTo(status: BookingStatus) {
    if (!this.canTransitionTo(status))
      throw new Error(`Transition de "${this.status}" vers "${status}" non autorisée.`);

    this.status = status;
    await this.save();
  }

  async markAsCompleted() {
    await this.transitionTo("completed");
    await this.save();
  }

  async markAsCancelled() {
    await this.transitionTo("cancelled");
    await this.save();
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
    status: {
      type: DataTypes.ENUM("confirmed", "completed", "cancelled"),
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
    indexes: [
      {
        unique: true,
        fields: ["ride_id", "passenger_id"], // une reservation par trajet par passager
      },
    ],
  }
);

export default Booking;
