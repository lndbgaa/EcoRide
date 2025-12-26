export const REVIEW_ERROR_MESSAGES = {
  INVALID_STATUS_TRANSITION: "errors:review.invalid_status_transition",

  CREATE: {
    IS_DRIVER: "errors:review.create.is_driver",
    TRIP_NOT_COMPLETED: "errors:review.create.trip_not_completed",
    BOOKING_NOT_COMPLETED: "errors:review.create.booking_not_completed",
    ALREADY_REVIEWED: "errors:review.create.already_reviewed",
  },
} as const;
