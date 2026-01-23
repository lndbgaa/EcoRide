import type { REVIEW_SORT_FIELDS, REVIEW_STATUSES } from "@/constants";
import type { Review } from "@/models";
import type { DateTimeDTO, TripAdminDTO, UserAdminDTO, UserPublicDTO } from "@/types";

/* ===========================
    Constants-based Types
   =========================== */

export type ReviewStatus = (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];
export type ReviewSortField = (typeof REVIEW_SORT_FIELDS)[number];

/* ===========================
       DTOs (Responses)
   =========================== */

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

/* ===========================
       Request Types
   =========================== */

export interface CreateReviewPayload {
  tripId: string;
  rating: number;
  comment?: string;
}

export interface GetMyReviewsQuery {
  sortBy?: "createdAt" | "rating";
  sortDir?: "asc" | "desc";
}

/* ===========================
       Service Types
   =========================== */

export interface GetReviewsFilters {
  status?: ReviewStatus;
  targetId?: string;
  authorId?: string;
}

export interface GetReviewsSortOptions {
  by?: ReviewSortField;
  dir?: "asc" | "desc";
}

/* ===========================
        Response Types
   =========================== */

export interface GetReviewsResponse {
  count: number;
  reviews: Review[];
}

/* ===========================
         DB Types
   =========================== */

export interface ReviewDBFilter {
  status?: ReviewStatus;
  target_id?: string;
  author_id?: string;
}
