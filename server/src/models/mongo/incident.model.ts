import dayjs from "dayjs";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

import { INCIDENT_ERROR_MESSAGES, INCIDENT_STATUSES } from "@/constants";
import { AppError, formatDateTimeFromUTC } from "@/utils";

import type {
  AssignmentEmbedded,
  IncidentDetailedDTO,
  IncidentDocument,
  IncidentPreviewDTO,
  ResolutionEmbedded,
  TripEmbedded,
  UserEmbedded,
} from "@/types";

const { PENDING, ASSIGNED, RESOLVED } = INCIDENT_STATUSES;

const { Schema } = mongoose;

const userSchema = new Schema<UserEmbedded>(
  {
    id: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: false },
  },
  { _id: false }
);

const tripSchema = new Schema<TripEmbedded>(
  {
    id: { type: String, required: true },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    departureDatetime: { type: Date, required: true },
    arrivalDatetime: { type: Date, required: true },
    driver: { type: userSchema, required: true },
  },
  { _id: false }
);

const assignmentSchema = new Schema<AssignmentEmbedded>(
  {
    at: { type: Date, default: Date.now },
    to: userSchema,
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
    trip: { type: tripSchema, required: true },
    passenger: { type: userSchema, required: true },
    amountInDispute: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUSES),
      default: PENDING,
    },
    assignment: {
      type: assignmentSchema,
      required: function (this: IncidentDocument): boolean {
        return this.status === ASSIGNED;
      },
    },
    resolution: {
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

incidentSchema.methods.isPending = function (
  this: IncidentDocument
): boolean {
  return this.status === PENDING;
};

incidentSchema.methods.isAssigned = function (
  this: IncidentDocument
): boolean {
  return this.status === ASSIGNED;
};

incidentSchema.methods.isResolved = function (
  this: IncidentDocument
): boolean {
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
      userMessageKey: INCIDENT_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
      debugMessage: `Incident ${this.id} cannot transition from ${this.status} to ${ASSIGNED}`,
    });
  }

  this.status = ASSIGNED;
  this.assignment = { at: dayjs().toDate(), to: moderator };
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
      userMessageKey: INCIDENT_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
      debugMessage: `Incident ${this.id} cannot transition from ${this.status} to ${RESOLVED}`,
    });
  }

  this.status = RESOLVED;
  this.resolution = { at: dayjs().toDate(), note };
  await this.save();
};

// ----------------------------
// DTOs
// ----------------------------

incidentSchema.methods.toPreviewDTO = function (
  this: IncidentDocument
): IncidentPreviewDTO {
  return {
    id: this._id,
    description: this.description,
    createdAt: formatDateTimeFromUTC(this.createdAt),
  };
};

incidentSchema.methods.toDetailedDTO = function (
  this: IncidentDocument
): IncidentDetailedDTO {
  const departure = formatDateTimeFromUTC(this.trip.departureDatetime);
  const arrival = formatDateTimeFromUTC(this.trip.arrivalDatetime);

  return {
    id: this._id,
    description: this.description,
    trip: {
      id: this.trip.id,
      departureLocation: this.trip.departureLocation,
      arrivalLocation: this.trip.arrivalLocation,
      departureDate: departure.date,
      departureTime: departure.time,
      arrivalDate: arrival.date,
      arrivalTime: arrival.time,
      driver: this.trip.driver,
    },
    passenger: this.passenger,
    amountInDispute: this.amountInDispute,
    status: this.status,
    createdAt: formatDateTimeFromUTC(this.createdAt),
    assignment: this.assignment
      ? {
          at: formatDateTimeFromUTC(this.assignment.at),
          to: this.assignment.to,
        }
      : undefined,
    resolution: this.resolution
      ? {
          at: formatDateTimeFromUTC(this.resolution.at),
          note: this.resolution.note,
        }
      : undefined,
  };
};

const Incident = mongoose.model<IncidentDocument>(
  "Incident",
  incidentSchema
);

export default Incident;
