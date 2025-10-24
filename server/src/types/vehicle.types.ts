import type { VEHICLE_STATUSES } from "@/constants";
import type { UserPublicDTO } from "@/types";

export type VehicleStatus = (typeof VEHICLE_STATUSES)[keyof typeof VEHICLE_STATUSES];

export interface VehiclePublicDTO {
  id: string;
  brand: string | null;
  model: string;
  color: string | null;
  energy: string | null;
  seats: number;
  isEco: boolean;
}

export interface VehiclePrivateDTO extends VehiclePublicDTO {
  licensePlate: string;
  firstRegistrationDate: string | null;
}

export interface VehicleAdminDTO extends VehiclePrivateDTO {
  status: VehicleStatus;
  owner: UserPublicDTO | null;
}
