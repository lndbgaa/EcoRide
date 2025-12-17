export const BOOKING_STATUSES = {
  CONFIRMED: "confirmed",
  AWAITING_FEEDBACK: "awaiting_feedback",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_MIN_MINUTES_BEFORE_CANCELLATION = 120; // 2h
