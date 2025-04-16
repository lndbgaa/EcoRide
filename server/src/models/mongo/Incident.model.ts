import mongoose, { Document } from "mongoose";

const { Schema } = mongoose;

type IncidentType = "delay" | "cancellation" | "danger" | "behavior" | "other";

export interface IncidentDocument extends Document {
  _id: string;
  type: IncidentType;
  rideId: string;
  passengerId: string;
  driverId: string;
  description: string;
  createdAt: Date;
  status?: "pending" | "under_review" | "resolved";
  closure?: {
    by: string;
    note: string;
    at: Date;
  };
}

// Sous-schema pour la clôture de l'incident, utilisé uniquement si l'incident est "resolved"
const resolutionSchema = new Schema(
  {
    by: {
      type: String,
      required: true,
    },
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
    },
    type: {
      type: String,
      enum: ["delay", "cancellation", "danger", "behavior", "other"],
      required: true,
    },
    rideId: {
      type: String,
      required: true,
    },
    passengerId: {
      type: String,
      required: true,
    },
    driverId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved"],
      default: "pending",
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
