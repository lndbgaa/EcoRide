import mongoose, { Document } from "mongoose";
import { v4 as uuid } from "uuid";

const { Schema } = mongoose;

export type IncidentStatus = "pending" | "assigned" | "resolved";

export interface RideEmbedded {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: Date;
}

export interface UserEmbedded {
  pseudo: string;
  email: string;
}

export interface IncidentDocument extends Document {
  _id: string;
  description: string;
  ride: RideEmbedded;
  passenger: UserEmbedded;
  driver: UserEmbedded;
  createdAt: Date;
  updatedAt: Date;
  status?: IncidentStatus;
  assignedTo?: string;
  closure?: {
    at: Date;
    note: string;
  };

  isPending(): boolean;
  isAssigned(): boolean;
  isResolved(): boolean;
  getAssignedTo(): string | undefined;
  markAsAssigned(employeeId: string): void;
  markAsResolved(note: string): void;
  toEmployeeDTO(): IncidentEmployeeDTO;
}

export interface IncidentPreviewDTO {
  id: string;
  description: string;
  createdAt: Date;
}

export interface IncidentEmployeeDTO extends IncidentPreviewDTO {
  ride: RideEmbedded;
  passenger: UserEmbedded;
  driver: UserEmbedded;
}

// Sous-schema pour les informations des utilisateurs impliqués
const userSchema = new Schema(
  {
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

incidentSchema.methods.markAsAssigned = function (
  this: IncidentDocument,
  employeeId: string
): void {
  this.status = "assigned";
  this.assignedTo = employeeId;
};

incidentSchema.methods.markAsResolved = function (
  this: IncidentDocument,
  note: string
): void {
  this.status = "resolved";
  this.closure = {
    at: new Date(),
    note,
  };
};

incidentSchema.methods.getAssignedTo = function (
  this: IncidentDocument
): string | undefined {
  return this.assignedTo;
};

incidentSchema.methods.toPreviewDTO = function (
  this: IncidentDocument
): IncidentPreviewDTO {
  return {
    id: this._id,
    description: this.description,
    createdAt: this.createdAt,
  };
};

incidentSchema.methods.toEmployeeDTO = function (
  this: IncidentDocument
): IncidentEmployeeDTO {
  return {
    id: this._id,
    description: this.description,
    ride: this.ride,
    passenger: this.passenger,
    driver: this.driver,
    createdAt: this.createdAt,
  };
};

const Incident = mongoose.model<IncidentDocument>("Incident", incidentSchema);

export default Incident;
