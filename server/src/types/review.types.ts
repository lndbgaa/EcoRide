import type { REVIEW_STATUSES } from "@/constants";
import type {
  DateTimeDTO,
  TripAdminDTO,
  TripPrivateDTO,
  TripPublicDTO,
  UserAdminDTO,
  UserPublicDTO,
} from "@/types";

export type ReviewStatus = (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export interface ReviewPublicDTO {
  id: string;
  rating: number;
  comment: string | null;
  author: UserPublicDTO | null;
  createdAt: DateTimeDTO;
}

export interface ReviewAuthorDTO {
  id: string;
  rating: number;
  comment: string | null;
  target: UserPublicDTO | null;
  trip: TripPublicDTO | null;
  createdAt: DateTimeDTO;
}

export interface ReviewTargetDTO {
  id: string;
  rating: number;
  comment: string | null;
  author: UserPublicDTO | null;
  trip: TripPrivateDTO | null;
  createdAt: DateTimeDTO;
}

export interface ReviewAdminDTO {
  id: string;
  rating: number;
  comment: string | null;
  author: UserAdminDTO | null;
  target: UserAdminDTO | null;
  trip: TripAdminDTO | null;
  status: ReviewStatus;
  createdAt: DateTimeDTO;
}
