import { DataTypes } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { RIDE_STATUSES } from "@/constants/index.js";
import { Base, User, Vehicle } from "@/models/mysql";
import AppError from "@/utils/AppError.js";
import { getDuration, toDateOnly, toTimeOnly } from "@/utils/date.utils.js";

import type { UserPublicDTO } from "@/models/mysql/User.model.js";
import type { VehiclePublicDTO } from "@/models/mysql/Vehicle.model.js";
import type { RideStatus } from "@/types/index.js";
import type { SaveOptions } from "sequelize";

export interface BaseDTO {
  id: string;
  departure_date: string;
  departure_location: string;
  departure_time: string;
  arrival_date: string;
  arrival_location: string;
  arrival_time: string;
  duration: number;
  is_eco_friendly: boolean;
  price: number;
}

export interface RidePublicPreviewDTO extends BaseDTO {
  available_seats: number;
  driver: UserPublicDTO | null;
}

export interface RidePrivatePreviewDTO extends BaseDTO {
  status: RideStatus;
}

export interface RideDetailedPublicDTO extends RidePublicPreviewDTO {
  vehicle: VehiclePublicDTO | null;
}

export interface RideDetailedPrivateDTO extends BaseDTO {
  vehicle: VehiclePublicDTO | null;
  offered_seats: number;
  available_seats: number;
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
    open: ["full", "in_progress", "cancelled"],
    full: ["open", "in_progress", "cancelled"],
    in_progress: ["completed"],
    completed: [],
    cancelled: [],
  } as const;

  /**
   * Vérifie si une transition vers un nouveau statut est autorisée.
   * @param status - Le nouveau statut à vérifier.
   * @returns `true` si la transition est autorisée, `false` sinon.
   */
  private canTransitionTo(status: RideStatus): boolean {
    const currentStatus: RideStatus = this.status;
    return Ride.allowedTransitions[currentStatus]?.includes(status) ?? false;
  }

  /**
   * Applique une transition vers un nouveau statut, si elle est autorisée.
   * @param status - Le nouveau statut à appliquer.
   * @param options - Options de la transaction.
   */
  private async transitionTo(status: RideStatus, options?: SaveOptions): Promise<void> {
    if (this.status === status) return;

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

  /**
   * Permet d'ajouter des places disponibles à un covoiturage (ex: annulation réservation)
   *
   * @param amount - Le nombre de places à ajouter.
   * @param options - Options de sauvegarde sequelize.
   */
  public async addAvailableSeats(amount: number, options?: SaveOptions): Promise<void> {
    if (this.status !== "open" && this.status !== "full") {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Le covoiturage est actuellement en statut "${this.status}".`,
      });
    }

    if (amount <= 0) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le nombre de places à ajouter doit être supérieur à 0.",
      });
    }

    if (this.available_seats + amount > this.offered_seats) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Impossible d'ajouter ${amount} place(s) : la capacité maximale est de ${this.offered_seats}.`,
      });
    }

    this.available_seats += amount;

    if (this.available_seats > 0 && this.status === "full") {
      await this.transitionTo("open", options);
    }

    await this.save(options);
  }

  /**
   * Permet de retirer des places disponibles à un covoiturage (ex: création réservation)
   *
   * @param amount - Le nombre de places à retirer.
   * @param options - Options de sauvegarde sequelize.
   */
  public async removeAvailableSeats(
    amount: number,
    options?: SaveOptions
  ): Promise<void> {
    if (this.status !== "open") {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Impossible de retirer des places : le covoiturage est "${this.status}" (aucune place disponible).`,
      });
    }

    if (amount <= 0) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le nombre de places à retirer doit être supérieur à 0.",
      });
    }

    if (amount > this.available_seats) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: `Seulement ${this.available_seats} place(s) disponible(s) pour ce covoiturage.`,
      });
    }

    this.available_seats -= amount;

    if (this.available_seats === 0) {
      await this.transitionTo("full", options);
    }

    await this.save(options);
  }

  public async markAsInProgress(options?: SaveOptions): Promise<void> {
    await this.transitionTo("in_progress", options);
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

  public getDepartureLocation(): string {
    return this.departure_location;
  }

  public getArrivalLocation(): string {
    return this.arrival_location;
  }

  public getDepartureDate(): Date {
    return this.departure_datetime;
  }

  public getArrivalDate(): Date {
    return this.arrival_datetime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getStatus(): RideStatus {
    return this.status;
  }

  public getDriverId(): string {
    return this.driver_id;
  }

  public getVehicleId(): string {
    return this.vehicle_id;
  }

  public getPrice(): number {
    return this.price;
  }

  public getAvailableSeats(): number {
    return this.available_seats;
  }

  public getOfferedSeats(): number {
    return this.offered_seats;
  }

  public isEcoFriendly(): boolean {
    return this.is_eco_friendly;
  }

  public isOpen(): boolean {
    return this.status === "open";
  }

  public isFull(): boolean {
    return this.status === "full";
  }

  public isInProgress(): boolean {
    return this.status === "in_progress";
  }

  public isCompleted(): boolean {
    return this.status === "completed";
  }

  public isCancelled(): boolean {
    return this.status === "cancelled";
  }

  private getBaseDTO(): BaseDTO {
    return {
      id: this.id,
      departure_date: toDateOnly(this.departure_datetime),
      departure_location: this.departure_location,
      departure_time: toTimeOnly(this.departure_datetime),
      arrival_date: toDateOnly(this.arrival_datetime),
      arrival_location: this.arrival_location,
      arrival_time: toTimeOnly(this.arrival_datetime),
      duration: this.duration,
      price: this.price,
      is_eco_friendly: this.is_eco_friendly,
    };
  }

  public toPublicPreviewDTO(): RidePublicPreviewDTO {
    return {
      ...this.getBaseDTO(),
      available_seats: this.available_seats,
      driver: this.driver?.toPublicDTO() ?? null,
    };
  }

  public toPrivatePreviewDTO(): RidePrivatePreviewDTO {
    return {
      ...this.getBaseDTO(),
      status: this.status,
    };
  }

  public toDetailedPublicDTO(): RideDetailedPublicDTO {
    return {
      ...this.toPublicPreviewDTO(),
      vehicle: this.vehicle?.toPublicDTO() ?? null,
    };
  }

  public toDetailedPrivateDTO(): RideDetailedPrivateDTO {
    return {
      ...this.toPrivatePreviewDTO(),
      vehicle: this.vehicle?.toPrivateDTO() ?? null,
      available_seats: this.available_seats,
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
      onDelete: "RESTRICT",
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vehicles",
        key: "id",
      },
      onDelete: "RESTRICT",
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
      type: DataTypes.ENUM(...Object.values(RIDE_STATUSES)),
      defaultValue: RIDE_STATUSES.OPEN,
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
});

Ride.beforeCreate((ride: Ride) => {
  ride.available_seats = ride.offered_seats;
  ride.duration = getDuration(ride.arrival_datetime, ride.departure_datetime);
});

export default Ride;
