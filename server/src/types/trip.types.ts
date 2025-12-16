import type { TRIP_STATUSES } from "@/constants";
import type { Trip } from "@/models/mysql";
import type {
  DateTimeDTO,
  UserAdminDTO,
  UserPublicDTO,
  VehicleAdminDTO,
  VehiclePrivateDTO,
  VehiclePublicDTO,
} from "@/types";

// ===========================
//    Constants-based Types
// =========================== */

export type TripStatus = (typeof TRIP_STATUSES)[keyof typeof TRIP_STATUSES];

// ===========================
//            DTOs
// =========================== */

export interface TripPublicDTO {
  id: string;
  departureDate: string;
  departureTime: string;
  departureLocation: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalLocation: string;
  duration: number;
  price: number;
  isEcoFriendly: boolean;
  availableSeats: number;
  offeredSeats: number;
  driver: UserPublicDTO | null;
  vehicle: VehiclePublicDTO | null;
  status: TripStatus;
}

export interface TripPrivateDTO {
  id: string;
  departureDate: string;
  departureTime: string;
  departureLocation: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalLocation: string;
  duration: number;
  price: number;
  isEcoFriendly: boolean;
  availableSeats: number;
  offeredSeats: number;
  vehicle: VehiclePrivateDTO | null;
  status: TripStatus;
  createdAt: DateTimeDTO;
}

export interface TripAdminDTO extends TripPrivateDTO {
  driver: UserAdminDTO | null;
  vehicle: VehicleAdminDTO | null;
}

// ===========================
//        Request Types
// =========================== */

export interface SearchTripsPayload {
  from: string;
  to: string;
  date: string;
  seats?: number;
  maxPrice?: number;
  maxDuration?: number;
  minRating?: number;
  ecoFriendly?: boolean;
}

export interface CreateTripPayload {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  vehicleId: string;
  price: number;
  offeredSeats: number;
}

// ===========================
//        Response Types
// =========================== */

export interface SearchTripsResponse {
  count: number;
  trips: Trip[];
}

// ===========================
//  Internal / DB Data Types
// =========================== */

export type CreateTripData = {
  departure_datetime: Date;
  departure_location: string;
  arrival_datetime: Date;
  arrival_location: string;
  driver_id: string;
  vehicle_id: string;
  price: number;
  offered_seats: number;
};
