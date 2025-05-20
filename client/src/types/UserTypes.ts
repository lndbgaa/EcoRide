import type { Booking } from "@/types/BookingTypes";
import type { Ride } from "@/types/RideTypes";

export interface User {
  role: "user";
  id: string;
  email: string;
  pseudo: string;
  firstName: string;
  lastName: string;
  isDriver: boolean;
  isPassenger: boolean;
  address: string | null;
  phone: string | null;
  birthDate: string | null;
  avatar: string | null;
  averageRating: string | null;
  credits: number;
  memberSince: string;
  lastLogin: string;
}

export interface UpdateUserInfo {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

export type UserUpcomingTrip = (Ride | Booking) & { type: "ride" | "booking" };

export type UserNextTrip = {
  type: "ride" | "booking";
  data: Ride | Booking;
};
