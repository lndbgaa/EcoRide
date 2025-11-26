import type { RIDE_STATUSES } from "@/constants";
import type { DateTimeDTO, UserAdminDTO, UserPublicDTO, VehicleAdminDTO, VehiclePrivateDTO, VehiclePublicDTO } from "@/types";

export type RideStatus = (typeof RIDE_STATUSES)[keyof typeof RIDE_STATUSES];

export interface RidePublicDTO {
  id: string;
  departureDate: string | null;
  departureTime: string | null;
  departureLocation: string;
  arrivalDate: string | null;
  arrivalTime: string | null;
  arrivalLocation: string;
  duration: number | null;
  price: number;
  isEcoFriendly: boolean;
  availableSeats: number;
  offeredSeats: number;
  driver: UserPublicDTO | null;
  vehicle: VehiclePublicDTO | null;
  status: RideStatus;
  createdAt: DateTimeDTO;
}

export interface RidePrivateDTO extends RidePublicDTO {
  vehicle: VehiclePrivateDTO | null;
}

export interface RideAdminDTO extends RidePrivateDTO {
  driver: UserAdminDTO | null;
  vehicle: VehicleAdminDTO | null;
}
