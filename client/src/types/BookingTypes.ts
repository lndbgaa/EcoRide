import type { Ride } from "./RideTypes";
import type { User } from "./UserTypes";

export interface Booking {
  id: string;
  ride: Ride;
  passenger: User;
  seatsBooked: number;
  status: string;
  createdAt: string;
}
