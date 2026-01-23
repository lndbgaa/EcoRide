export const REVIEW_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const REVIEW_SORT_FIELDS = ["createdAt", "rating"] as const;

export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 5;
