export const TRIP_STATUSES = {
  OPEN: "open",
  FULL: "full",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const TRIP_MIN_DURATION_MINUTES = 5;
export const TRIP_MAX_DURATION_MINUTES = 1440;

export const TRIP_MIN_SEATS = 1;
export const TRIP_MAX_SEATS = 8;

export const TRIP_MIN_PRICE = 10;
export const TRIP_MAX_PRICE = 1000;

export const TRIP_MIN_MINUTES_BEFORE_CANCELLATION = 1440;
export const TRIP_MIN_MINUTES_BEFORE_STARTING = 30;
export const TRIP_MAX_MINUTES_AFTER_STARTING = 60;

export const TRIP_SORT_FIELDS = ["createdAt" , "departureDate"] as const;