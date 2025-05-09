import { Ride } from "./RideTypes";

export interface Booking {
  id: string;
  ride: Ride;
  seatsBooked: number;
  status: string;
  createdAt: string;
}
