export const REVIEW_ERROR_MESSAGES = {
  STATE_TRANSITION_NOT_ALLOWED: "errors:review.status_transition_not_allowed",

  CREATE: {
    IS_DRIVER: "errors:review.create.is_driver",
    TRIP_NOT_COMPLETED: "errors:review.create.trip_not_completed",
    BOOKING_NOT_COMPLETED: "errors:review.create.booking_not_completed",
    ALREADY_REVIEWED: "errors:review.create.already_reviewed",
  },

  MODERATE: {
    ALREADY_MODERATED: "errors:review.moderate.already_moderated",
  },
} as const;
