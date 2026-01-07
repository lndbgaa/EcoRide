import type { BOOKING_STATUSES } from "@/constants";
import type { Booking } from "@/models";
import type { DateTimeDTO, TripAdminDTO, TripPublicDTO, UserAdminDTO, UserPublicDTO } from "@/types";

// ===========================
//    Constants-based Types
// =========================== */

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

// ===========================
//       DTOs (Responses)
// =========================== */

export interface BookingPublicDTO {
  id: string;
  passenger: UserPublicDTO | null;
  seatsBooked: number;
}

export interface BookingPassengerDTO {
  id: string;
  trip: TripPublicDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: DateTimeDTO;
}

export interface BookingAdminDTO {
  id: string;
  trip: TripAdminDTO | null;
  passenger: UserAdminDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: DateTimeDTO;
}

// ===========================
//        Request Types
// =========================== */
export interface CreateBookingPayload {
  tripId: string;
  seatsToBook: number;
}

export interface ReportBookingIncidentPayload {
  description: string;
}

// ===========================
//       Service Types
// ===========================

export type BookingSortField = "createdAt" | "departureDate";

export interface GetBookingsFilters {
  status?: BookingStatus | BookingStatus[];
  passengerId?: string;
}
export interface GetBookingsSortOptions {
  by?: BookingSortField;
  dir?: "asc" | "desc";
}

// ===========================
//        Response Types
// =========================== */

export interface GetBookingsResponse {
  count: number;
  bookings: Booking[];
}
