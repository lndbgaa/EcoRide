import mongoose, { Document } from "mongoose";
import { v4 as uuid } from "uuid";

import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";

const { Schema } = mongoose;

import type { IncidentStatus } from "@/types/index.js";

export interface RideEmbedded {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  arrivalDate: string;
  price: number;
}

export interface UserEmbedded {
  id: string;
  pseudo: string;
  email: string;
}

export interface IncidentDocument extends Document {
  _id: string;
  description: string;
  ride: RideEmbedded;
  passenger: UserEmbedded;
  driver: UserEmbedded;
  rewardAmount: number;
  status: IncidentStatus;
  assignedTo?: string;
  closure?: {
    at: Date;
    note: string;
  };
  createdAt: Date;
  updatedAt: Date;

  isPending(): boolean;
  isAssigned(): boolean;
  isResolved(): boolean;
  getAssignedTo(): string | undefined;
  getRideId(): string;
  getPassengerId(): string;
  getDriverId(): string;
  getRewardAmount(): number;
  markAsAssigned(employeeId: string): void;
  markAsResolved(note: string): void;
  toDetailedDTO(): IncidentDetailedDTO;
  toPreviewDTO(): IncidentPreviewDTO;
}

export interface IncidentPreviewDTO {
  id: string;
  description: string;
  createdAt: string;
}

export interface IncidentDetailedDTO extends IncidentPreviewDTO {
  ride: RideEmbedded & { departureTime: string; arrivalTime: string };
  passenger: UserEmbedded;
  driver: UserEmbedded;
  status: IncidentStatus;
}

// Sous-schema pour les informations des utilisateurs impliqués
const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    pseudo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Sous-schema pour les informations du trajet impliqué
const rideSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    departureLocation: {
      type: String,
      required: true,
    },
    arrivalLocation: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Sous-schema pour la clôture de l'incident, utilisé uniquement si l'incident est "resolved"
const resolutionSchema = new Schema(
  {
    at: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Schéma principal de l'incident
const incidentSchema = new Schema<IncidentDocument>(
  {
    _id: {
      type: String,
      required: true,
      default: uuid,
    },
    description: {
      type: String,
      required: true,
    },
    ride: {
      type: rideSchema,
      required: true,
    },
    passenger: {
      type: userSchema,
      required: true,
    },
    driver: {
      type: userSchema,
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "resolved"],
      default: "pending",
    },
    assignedTo: {
      type: String,
      required: function (this: IncidentDocument): boolean {
        return this.status === "assigned";
      },
    },
    closure: {
      type: resolutionSchema,
      required: function (this: IncidentDocument): boolean {
        return this.status === "resolved";
      },
    },
  },
  { timestamps: true, collection: "incidents" }
);

incidentSchema.methods.isPending = function (this: IncidentDocument): boolean {
  return this.status === "pending";
};

incidentSchema.methods.isAssigned = function (this: IncidentDocument): boolean {
  return this.status === "assigned";
};

incidentSchema.methods.isResolved = function (this: IncidentDocument): boolean {
  return this.status === "resolved";
};

incidentSchema.methods.markAsAssigned = function (this: IncidentDocument, employeeId: string): void {
  this.status = "assigned";
  this.assignedTo = employeeId;
};

incidentSchema.methods.markAsResolved = function (this: IncidentDocument, note: string): void {
  this.status = "resolved";
  this.closure = {
    at: new Date(),
    note,
  };
};

incidentSchema.methods.getAssignedTo = function (this: IncidentDocument): string | undefined {
  return this.assignedTo;
};

incidentSchema.methods.getRideId = function (this: IncidentDocument): string {
  return this.ride.id;
};

incidentSchema.methods.getPassengerId = function (this: IncidentDocument): string {
  return this.passenger.id;
};

incidentSchema.methods.getDriverId = function (this: IncidentDocument): string {
  return this.driver.id;
};

incidentSchema.methods.getRewardAmount = function (this: IncidentDocument): number {
  return this.rewardAmount;
};

incidentSchema.methods.toPreviewDTO = function (this: IncidentDocument): IncidentPreviewDTO {
  return {
    id: this._id,
    description: this.description,
    createdAt: toDateOnly(this.createdAt),
  };
};

incidentSchema.methods.toDetailedDTO = function (this: IncidentDocument): IncidentDetailedDTO {
  return {
    id: this._id,
    description: this.description,
    ride: {
      id: this.ride.id,
      departureLocation: this.ride.departureLocation,
      arrivalLocation: this.ride.arrivalLocation,
      departureDate: toDateOnly(this.ride.departureDate),
      departureTime: toTimeOnly(this.ride.departureDate),
      arrivalDate: toDateOnly(this.ride.arrivalDate),
      arrivalTime: toTimeOnly(this.ride.arrivalDate),
      price: this.ride.price,
    },
    passenger: this.passenger,
    driver: this.driver,
    status: this.status,
    createdAt: toDateOnly(this.createdAt),
  };
};

const Incident = mongoose.model<IncidentDocument>("Incident", incidentSchema);

export default Incident;
