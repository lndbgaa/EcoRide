export type Ride = {
  id: string;
  departure_date: string;
  departure_location: string;
  departure_time: string;
  arrival_date: string;
  arrival_location: string;
  arrival_time: string;
  duration: number;
  price: number;
  is_eco_friendly: boolean;
  status: "open" | "full" | "in_progress" | "completed" | "cancelled";
};

export type SearchRideRequestData = {
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
};
