import type { Booking } from "@/types/BookingTypes";
import type { User } from "@/types/UserTypes";
import type { Vehicle } from "@/types/VehicleTypes";

export type RideStatus = "open" | "full" | "in_progress" | "completed" | "cancelled";

export type Ride = {
  id: string;
  departureDate: string;
  departureLocation: string;
  departureTime: string;
  arrivalDate: string;
  arrivalLocation: string;
  arrivalTime: string;
  duration: number;
  price: number;
  availableSeats: number;
  offeredSeats: number;
  driver: User;
  vehicle: Vehicle;
  isEcoFriendly: boolean;
  status: RideStatus;
  createdAt: string;
};

export type RideDetails = {
  ride: Ride;
  preferences: string[];
  bookings: Booking[];
};

export type CreateRideData = {
  arrivalLocation: string;
  departureLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  vehicleId: string;
  price: number;
  offeredSeats: number;
};

export type SearchRide = {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  isEcoFriendly: boolean;
  maxPrice: number;
  maxDuration: number;
  minRating: string | undefined;
};

export type SearchRideWithoutFilters = {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
};
