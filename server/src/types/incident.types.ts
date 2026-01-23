import type { INCIDENT_SORT_FIELDS, INCIDENT_STATUSES } from "@/constants";
import type { DateTimeDTO } from "@/types";
import type { Document } from "mongoose";

/* ===========================
    Constants-based Types
   =========================== */

export type IncidentStatus = (typeof INCIDENT_STATUSES)[keyof typeof INCIDENT_STATUSES];
export type IncidentSortField = (typeof INCIDENT_SORT_FIELDS)[number];

/* ===========================
       Embedded Types
   =========================== */
export interface UserEmbedded {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TripEmbedded {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  driver: UserEmbedded;
}

export interface AssignmentEmbedded {
  at: Date;
  to: UserEmbedded;
}

export interface ResolutionEmbedded {
  at: Date;
  note: string;
}

/* ===========================
     Document Interface
   =========================== */

export interface IncidentDocument extends Document {
  _id: string;
  description: string;
  trip: TripEmbedded;
  passenger: UserEmbedded;
  amountInDispute: number;
  status: IncidentStatus;
  assignment?: AssignmentEmbedded;
  resolution?: ResolutionEmbedded;
  createdAt: Date;
  updatedAt: Date;

  isPending(): boolean;
  isAssigned(): boolean;
  isResolved(): boolean;
  markAsAssigned(moderator: UserEmbedded): Promise<void>;
  markAsResolved(note: string): Promise<void>;
  toPreviewDTO(): IncidentPreviewDTO;
  toDetailedDTO(): IncidentDetailedDTO;
}

/* ===========================
       DTOs (Responses)
   =========================== */

export interface TripEmbeddedDTO {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  driver: UserEmbedded;
}

export interface IncidentPreviewDTO {
  id: string;
  description: string;
  createdAt: DateTimeDTO;
}

export interface IncidentDetailedDTO extends IncidentPreviewDTO {
  trip: TripEmbeddedDTO;
  passenger: UserEmbedded;
  amountInDispute: number;
  status: IncidentStatus;
  assignment?: {
    at: DateTimeDTO;
    to: UserEmbedded;
  };
  resolution?: {
    at: DateTimeDTO;
    note: string;
  };
}

/* ===========================
       Request Types
   =========================== */

export interface GetIncidentsQuery {
  status?: IncidentStatus;
  sortDir?: "asc" | "desc";
}

export interface GetMyIncidentsQuery {
  status?: Exclude<IncidentStatus, "pending">;
  sortDir?: "asc" | "desc";
}

/* ===========================
       Service Types
   =========================== */
export interface GetIncidentsSortOptions {
  by?: IncidentSortField;
  dir: "asc" | "desc";
}

export interface GetIncidentsFilters {
  status?: IncidentStatus;
  moderatorId?: string;
}

/* ===========================
        Response Types
   =========================== */

export interface GetIncidentsResponse {
  count: number;
  incidents: IncidentDocument[];
}

/* ===========================
         DB Types
   =========================== */

export interface IncidentDBFilter {
  status?: IncidentStatus;
  "assignment.to.id"?: string;
}
