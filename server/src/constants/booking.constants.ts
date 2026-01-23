export const BOOKING_STATUSES = {
  CONFIRMED: "confirmed",
  AWAITING_FEEDBACK: "awaiting_feedback",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_SORT_FIELDS = ["createdAt", "departureDate"] as const;

export const BOOKING_MIN_MINUTES_BEFORE_CANCELLATION = 120;

export const PLATFORM_FEE_PER_SEAT = 2;
