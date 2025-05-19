export type IncidentStatus = "pending" | "assigned" | "resolved";

import type { Ride } from "./RideTypes";
import type { User } from "./UserTypes";

export interface IncidentPreview {
  id: string;
  description: string;
  createdAt: string;
}

export interface IncidentDetailed extends IncidentPreview {
  ride: Ride;
  driver: User;
  passenger: User;
  status: IncidentStatus;
}

export interface IncidentResolution {
  resolutionNote: string;
}
