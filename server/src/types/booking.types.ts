import type { BOOKING_STATUSES } from "@/constants";
import type { DateTimeDTO, RideAdminDTO, RidePublicDTO, UserAdminDTO, UserPublicDTO } from "@/types";

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export interface BookingPublicDTO {
  id: string;
  passenger: UserPublicDTO | null;
  seatsBooked: number;
}

export interface BookingPassengerDTO {
  id: string;
  ride: RidePublicDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: DateTimeDTO;
  updatedAt: DateTimeDTO;
}

export interface BookingDriverDTO {
  id: string;
  passenger: UserPublicDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: DateTimeDTO;
}

export interface BookingAdminDTO {
  id: string;
  ride: RideAdminDTO | null;
  passenger: UserAdminDTO | null;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: DateTimeDTO;
  updatedAt: DateTimeDTO;
}
