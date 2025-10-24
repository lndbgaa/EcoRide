import type { REVIEW_STATUSES } from "@/constants";
import type {
  DateTimeDTO,
  RideAdminDTO,
  RidePrivateDTO,
  RidePublicDTO,
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
  ride: RidePublicDTO | null;
  createdAt: DateTimeDTO;
}

export interface ReviewTargetDTO {
  id: string;
  rating: number;
  comment: string | null;
  author: UserPublicDTO | null;
  ride: RidePrivateDTO | null;
  createdAt: DateTimeDTO;
}

export interface ReviewAdminDTO {
  id: string;
  rating: number;
  comment: string | null;
  author: UserAdminDTO | null;
  target: UserAdminDTO | null;
  ride: RideAdminDTO | null;
  status: ReviewStatus;
  createdAt: DateTimeDTO;
  updatedAt: DateTimeDTO;
}
