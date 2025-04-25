import { sequelize } from "@/config/mysql.config.js";
import AppError from "@/utils/AppError.js";
import { getDuration, toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import { DataTypes, Transaction } from "sequelize";
import Base from "./Base.model.js";
import type { UserPublicDTO } from "./User.model.js";
import User from "./User.model.js";
import type { VehiclePrivateDTO, VehiclePublicDTO } from "./Vehicle.model.js";
import Vehicle from "./Vehicle.model.js";

import type { RideStatus } from "@/types/index.js";

export interface RidePublicDTO {
  id: string;
  departure_date: string;
  departure_location: string;
  departure_time: string;
  arrival_date: string;
  arrival_location: string;
  arrival_time: string;
  duration: number;
  driver: UserPublicDTO | null;
  vehicle: VehiclePublicDTO | null;
  is_eco_friendly: boolean;
  price: number;
  available_seats: number;
}

export interface RidePrivateDTO extends Omit<RidePublicDTO, "driver" | "vehicle"> {
  offered_seats: number;
  vehicle: VehiclePrivateDTO | null;
}

/**
 * Modèle représentant un covoiturage de la plateforme.
 *
 * @extends Base
 */
class Ride extends Base {
  declare id: string;
  declare departure_datetime: Date;
  declare departure_location: string;
  declare arrival_datetime: Date;
  declare arrival_location: string;
  declare duration: number;
  declare driver_id: string;
  declare vehicle_id: string;
  declare price: number;
  declare offered_seats: number;
  declare available_seats: number;
  declare is_eco_friendly: boolean;
  declare status: RideStatus;
  declare created_at: Date;
  declare updated_at: Date;

  // Associations chargées dynamiquement via Sequelize (si `include` est utilisé).
  declare driver?: User;
  declare vehicle?: Vehicle;

  /**
   * Liste des transitions autorisées entre les statuts d'un trajet.
   */
  private static readonly allowedTransitions: Record<RideStatus, RideStatus[]> = {
    open: ["full", "cancelled", "in_progress"],
    full: ["in_progress", "cancelled", "no_show"],
    in_progress: ["completed"],
    completed: [],
    cancelled: [],
    no_show: [],
  };

  /**
   * Vérifie si une transition vers un nouveau statut est autorisée.
   */
  private canTransitionTo(status: RideStatus): boolean {
    const currentStatus: RideStatus = this.status;
    return Ride.allowedTransitions[currentStatus]?.includes(status) ?? false;
  }

  /**
   * Applique une transition vers un nouveau statut, si elle est autorisée.
   */
  public async transitionTo(status: RideStatus) {
    if (this.status === status) return;

    if (!this.canTransitionTo(status)) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Transition de "${this.status}" vers "${status}" non autorisée.`,
      });
    }

    this.status = status;
    await this.save();
  }

  /**
   * Permet d'ajouter des places disponibles à un covoiturage (ex: annulation réservation)
   * */
  async addSeats(amount: number, options: { transaction?: Transaction }): Promise<void> {
    try {
      if (this.status !== "open") {
        throw new Error(`Le covoiturage est actuellement en statut "${this.status}".`);
      }

      if (amount <= 0) {
        throw new Error("Le nombre de places à ajouter doit être supérieur à 0.");
      }

      if (this.available_seats + amount > this.offered_seats) {
        throw new Error(
          `Impossible d'ajouter ${amount} place(s) : la capacité maximale est de ${this.offered_seats}.`
        );
      }

      this.available_seats += amount;
      if (this.available_seats > 0 && this.status !== "open") await this.transitionTo("open");
      await this.save(options);
    } catch (err) {
      const message = `addSeats → ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(message);
    }
  }

  /**
   *  Permet de retirer des places disponibles à un covoiturage (ex: création réservation)
   * */
  async removeSeats(amount: number, options: { transaction?: Transaction }): Promise<void> {
    try {
      if (!["open", "full"].includes(this.status)) {
        throw new Error(`Le covoiturage est actuellement en statut "${this.status}".`);
      }

      if (amount <= 0) {
        throw new Error("Le nombre de places à retirer doit être supérieur à 0.");
      }
      if (amount > this.available_seats)
        throw new Error(`Seulement ${this.available_seats} disponibles pour ce covoiturage.`);

      this.available_seats -= amount;
      if (this.available_seats === 0 && this.status !== "full") await this.transitionTo("full");
      await this.save(options);
    } catch (err) {
      const message = `[Ride] removeSeats → ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(message);
    }
  }

  public async markAsInProgress(): Promise<void> {
    await this.transitionTo("in_progress");
  }

  public async markAsCompleted(): Promise<void> {
    await this.transitionTo("completed");
  }

  public async markAsNoShow(): Promise<void> {
    await this.transitionTo("no_show");
  }

  public async markAsCancelled(): Promise<void> {
    await this.transitionTo("cancelled");
  }

  public isOpen(): boolean {
    return this.status === "open";
  }

  public getPrice(): number {
    return this.price;
  }

  /**
   * Retourne une version "publique" du trajet.
   */
  toPublicDTO(): RidePublicDTO {
    return {
      id: this.id,
      departure_date: toDateOnly(this.departure_datetime),
      departure_location: this.departure_location,
      departure_time: toTimeOnly(this.departure_datetime),
      arrival_date: toDateOnly(this.arrival_datetime),
      arrival_location: this.arrival_location,
      arrival_time: toTimeOnly(this.arrival_datetime),
      duration: this.duration,
      driver: this.driver?.toPublicDTO() ?? null,
      vehicle: this.vehicle?.toPublicDTO() ?? null,
      price: this.price,
      available_seats: this.available_seats,
      is_eco_friendly: this.is_eco_friendly,
    };
  }

  /**
   * Retourne une version "privée" du trajet.
   *
   * 💡 Utile lorsque le chauffeur consulte son covoiturage.
   */
  toPrivateDTO(): RidePrivateDTO {
    const { driver, ...publicDTOWithoutDriver } = this.toPublicDTO();
    return {
      ...publicDTOWithoutDriver,
      vehicle: this.vehicle?.toPrivateDTO() ?? null,
      offered_seats: this.offered_seats,
    };
  }
}

Ride.init(
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
    },
    arrival_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arrival_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    driver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vehicles",
        key: "id",
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [10],
          msg: "Le prix doit être au minimum de 10 crédits (1€).",
        },
        max: {
          args: [500],
          msg: "Le prix doit être au maximum de 500 crédits (50 €).",
        },
      },
    },
    offered_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Le nombre de places proposées doit être au minimum de 1.", // sans compter le chauffeur
        },
        max: {
          args: [6],
          msg: "Le nombre de places proposées doit être au maximum de 6.", // sans compter le chauffeur
        },
      },
    },
    available_seats: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: "Le nombre de places disponibles ne peut pas être négatif.",
        },
      },
    },
    is_eco_friendly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        ...(["open", "full", "in_progress", "completed", "no_show", "cancelled"] as RideStatus[])
      ),
      defaultValue: "open",
    },
  },
  {
    sequelize,
    modelName: "Ride",
    tableName: "rides",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Ride.beforeValidate((ride: Ride) => {
  const now = Date.now();

  // Cas 1 : Le départ doit être après maintenant.
  if (ride.departure_datetime.getTime() <= now) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "La date de départ doit être ultérieure à la date actuelle.",
    });
  }

  // Cas 2 : Le départ doit être antérieur à l'arrivée.
  if (ride.departure_datetime >= ride.arrival_datetime) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "La date de départ doit être antérieure à la date d'arrivée.",
    });
  }

  // Cas 3 : Le nombre de places proposées doit être au minimum de 1.
  if (ride.offered_seats < 1) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Le nombre de places proposées doit être au minimum de 1.",
    });
  }

  // Cas 4 : Les places disponibles ne peuvent pas dépasser les places proposées.
  if (ride.available_seats > ride.offered_seats) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message:
        "Le nombre de places disponibles ne peut pas dépasser le nombre de places proposées.",
    });
  }
});

Ride.beforeCreate((ride: Ride) => {
  // Définit par défaut le nombre de places disponibles comme égal aux nombres de places proposées.
  ride.available_seats = ride.available_seats ?? ride.offered_seats;

  // Définit la durée du trajet en minutes.
  ride.duration = getDuration(ride.arrival_datetime, ride.departure_datetime);
});

export default Ride;
