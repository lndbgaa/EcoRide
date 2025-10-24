import dayjs from "dayjs";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

import { INCIDENT_STATUSES } from "@/constants/incident.constants.js";

import AppError from "@/utils/AppError.js";
import { formatDateTime, toDateOnly, toTimeOnly } from "@/utils/date.utils.js";

import type {
  IncidentDetailedDTO,
  IncidentDocument,
  IncidentPreviewDTO,
  ResolutionEmbedded,
  RideEmbedded,
  UserEmbedded,
  VehicleEmbedded,
} from "@/types/incident.types.js";

const { PENDING, ASSIGNED, RESOLVED } = INCIDENT_STATUSES;

const { Schema } = mongoose;

const userSchema = new Schema<UserEmbedded>(
  {
    id: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const vehicleSchema = new Schema<VehicleEmbedded>(
  {
    id: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    energy: { type: String, required: true },
    seats: { type: Number, required: true },
    licensePlate: { type: String, required: true },
    firstRegistrationDate: { type: Date, required: true },
  },
  { _id: false }
);

const rideSchema = new Schema<RideEmbedded>(
  {
    id: { type: String, required: true },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    departureDatetime: { type: Date, required: true },
    arrivalDatetime: { type: Date, required: true },
    driver: { type: userSchema, required: true },
    vehicle: { type: vehicleSchema, required: true },
    price: { type: Number, required: true },
    offeredSeats: { type: Number, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const resolutionSchema = new Schema<ResolutionEmbedded>(
  {
    at: { type: Date, default: Date.now },
    note: { type: String, required: true },
  },
  { _id: false }
);

const incidentSchema = new Schema<IncidentDocument>(
  {
    _id: { type: String, required: true, default: uuid },
    description: { type: String, required: true },
    ride: { type: rideSchema, required: true },
    passenger: { type: userSchema, required: true },
    amountInDispute: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUSES),
      default: PENDING,
    },
    assignedTo: {
      type: userSchema,
      required: function (this: IncidentDocument): boolean {
        return this.status === ASSIGNED;
      },
    },
    closure: {
      type: resolutionSchema,
      required: function (this: IncidentDocument): boolean {
        return this.status === RESOLVED;
      },
    },
  },
  { timestamps: true, collection: "incidents" }
);

// ----------------------------
// Status Checks
// ----------------------------

incidentSchema.methods.isPending = function (this: IncidentDocument): boolean {
  return this.status === PENDING;
};

incidentSchema.methods.isAssigned = function (this: IncidentDocument): boolean {
  return this.status === ASSIGNED;
};

incidentSchema.methods.isResolved = function (this: IncidentDocument): boolean {
  return this.status === RESOLVED;
};

// ----------------------------
// Public Status Transitions
// ----------------------------

const allowedStatusTransitions: Record<string, string[]> = {
  pending: [ASSIGNED],
  assigned: [RESOLVED],
  resolved: [],
} as const;

const canTransitionTo = (status: string, newStatus: string): boolean => {
  return allowedStatusTransitions[status]?.includes(newStatus) ?? false;
};

incidentSchema.methods.markAsAssigned = async function (
  this: IncidentDocument,
  moderator: UserEmbedded
): Promise<void> {
  if (this.status === ASSIGNED) return;

  if (!canTransitionTo(this.status, ASSIGNED)) {
    throw new AppError({
      statusCode: 400,
      userMessage: "",
      debugMessage: `Incident ${this.id} cannot transition from ${this.status} to ${ASSIGNED}`,
    });
  }

  this.status = ASSIGNED;
  this.assignedTo = moderator;
  await this.save();
};

incidentSchema.methods.markAsResolved = async function (
  this: IncidentDocument,
  note: string
): Promise<void> {
  if (this.status === RESOLVED) return;

  if (!canTransitionTo(this.status, RESOLVED)) {
    throw new AppError({
      statusCode: 400,
      userMessage: "",
      debugMessage: `Incident${this.id} cannot transition from ${this.status} to ${RESOLVED}`,
    });
  }

  this.status = RESOLVED;
  this.closure = { at: dayjs().toDate(), note };
  await this.save();
};

// ----------------------------
// DTOs
// ----------------------------

incidentSchema.methods.toPreviewDTO = function (this: IncidentDocument): IncidentPreviewDTO {
  return {
    id: this._id,
    description: this.description,
    createdAt: formatDateTime(this.createdAt),
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
      departureDate: toDateOnly(this.ride.departureDatetime),
      departureTime: toTimeOnly(this.ride.departureDatetime),
      arrivalDate: toDateOnly(this.ride.arrivalDatetime),
      arrivalTime: toTimeOnly(this.ride.arrivalDatetime),
      driver: this.ride.driver,
      vehicle: this.ride.vehicle,
      price: this.ride.price,
      offeredSeats: this.ride.offeredSeats,
      createdAt: this.ride.createdAt,
    },
    passenger: this.passenger,
    amountInDispute: this.amountInDispute,
    status: this.status,
    createdAt: formatDateTime(this.createdAt),
    assignedTo: this.assignedTo ?? undefined,
    closure: this.closure
      ? {
          at: formatDateTime(this.closure.at),
          note: this.closure.note,
        }
      : undefined,
  };
};

const Incident = mongoose.model<IncidentDocument>("Incident", incidentSchema);

export default Incident;
