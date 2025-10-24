import type { INCIDENT_STATUSES } from "@/constants";
import type { DateTimeDTO } from "@/types";
import type { Document } from "mongoose";

export type IncidentStatus = (typeof INCIDENT_STATUSES)[keyof typeof INCIDENT_STATUSES];

export interface UserEmbedded {
  id: string;
  email: string;
}

export interface VehicleEmbedded {
  id: string;
  brand: string;
  model: string;
  color: string;
  energy: string;
  seats: number;
  licensePlate: string;
  firstRegistrationDate: Date;
}

export interface RideEmbedded {
  id: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDatetime: Date;
  arrivalDatetime: Date;
  driver: UserEmbedded;
  vehicle: VehicleEmbedded;
  price: number;
  offeredSeats: number;
  createdAt: Date;
}

export interface ResolutionEmbedded {
  at: Date;
  note: string;
}

export interface IncidentDocument extends Document {
  _id: string;
  description: string;
  ride: RideEmbedded;
  passenger: UserEmbedded;
  amountInDispute: number;
  status: IncidentStatus;
  assignedTo?: UserEmbedded;
  closure?: ResolutionEmbedded;
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

export interface IncidentPreviewDTO {
  id: string;
  description: string;
  createdAt: DateTimeDTO;
}

export interface IncidentDetailedDTO extends IncidentPreviewDTO {
  ride: Omit<RideEmbedded, "departureDatetime" | "arrivalDatetime"> & {
    departureDate: string | null;
    departureTime: string | null;
    arrivalDate: string | null;
    arrivalTime: string | null;
  };
  passenger: UserEmbedded;
  amountInDispute: number;
  status: IncidentStatus;
  assignedTo?: UserEmbedded | undefined;
  closure?:
    | {
        at: DateTimeDTO;
        note: string;
      }
    | undefined;
}
