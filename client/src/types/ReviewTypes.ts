import type { Ride } from "./RideTypes";
import type { User } from "./UserTypes";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: {
    date: string;
    time: string;
  };
}

export interface CreateReviewData {
  rideId: string;
  rating: number;
  comment: string;
}

export interface ReceivedReview extends Review {
  author: User | null;
}

export interface WrittenReview extends Review {
  target: User | null;
}

export interface ReviewToModerate extends Review {
  author: User | null;
  target: User | null;
  ride: Ride | null;
}
