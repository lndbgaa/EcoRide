import mongoose, { Document } from "mongoose";
import { v4 as uuid } from "uuid";

const { Schema } = mongoose;

export type IncidentType =
  | "delay"
  | "cancellation"
  | "danger"
  | "behavior"
  | "other";

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
  type: IncidentType;
  ride: RideEmbedded;
  passenger: UserEmbedded;
  driver: UserEmbedded;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status?: "pending" | "under_review" | "resolved";
  assignedTo?: string;
  closure?: {
    at: Date;
    note: string;
  };
}

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
    type: {
      type: String,
      enum: ["delay", "cancellation", "danger", "behavior", "other"],
      required: true,
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
      enum: ["pending", "under_review", "resolved"],
    },
    assignedTo: {
      type: String,
      default: null,
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

const Incident = mongoose.model<IncidentDocument>("Incident", incidentSchema);

export default Incident;
