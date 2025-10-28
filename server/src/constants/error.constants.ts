export const ERROR_CODES = {
  COMMON: {
    INTERNAL_ERROR: "INTERNAL_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  },

  AUTH: {
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
    ACCOUNT_PENDING_DELETION: "ACCOUNT_PENDING_DELETION",
    ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
    SESSION_INVALID: "SESSION_INVALID",
  },
} as const;

export const ERROR_MESSAGES = {
  COMMON: {
    INTERNAL_SERVER_ERROR: "errors.common.internal_server_error",
    RESOURCE_NOT_FOUND: "errors.common.resource_not_found",
    VALIDATION_ERROR: "errors.common.validation_error",
  },

  AUTH: {
    EMAIL_ALREADY_EXISTS: "errors.auth.email_already_exists",
    USERNAME_ALREADY_EXISTS: "errors.auth.username_already_exists",
    EMAIL_NOT_VERIFIED: "errors.auth.email_not_verified",
    EMAIL_ALREADY_VERIFIED: "errors.auth.email_already_verified",
    EMAIL_VERIFICATION_TOKEN_INVALID: "errors.auth.email_verification_token_invalid",
    EMAIL_VERIFICATION_SEND_FAILED: "errors.auth.email_verification_send_failed",
    INVALID_CREDENTIALS: "errors.auth.invalid_credentials",
    ACCOUNT_SUSPENDED: "errors.auth.account_suspended",
    ACCOUNT_PENDING_DELETION: "errors.auth.account_pending_deletion",

    SESSION_INVALID: "errors.auth.session_invalid",
  },

  USER: {
    NOT_FOUND: "errors.user.not_found",
    INVALID_STATUS_TRANSITION: "errors.user.invalid_status_transition",
    INVALID_CREDIT_AMOUNT: "errors.user.invalid_credit_amount",
    INSUFFICIENT_CREDITS: "errors.user.insufficient_credits",
  },
  VEHICLE: {
    INVALID_STATUS_TRANSITION: "errors.vehicle.invalid_status_transition",
  },
  RIDE: {
    INVALID_STATUS_TRANSITION: "errors.ride.invalid_status_transition",
    CANNOT_MODIFY_SEATS: "errors.ride.cannot_modify_seats",
    INVALID_SEAT_AMOUNT: "errors.ride.invalid_seat_amount",
    EXCEEDS_OFFERED_SEATS: "errors.ride.exceeds_offered_seats",
    NOT_ENOUGH_AVAILABLE_SEATS: "errors.ride.not_enough_available_seats",
  },
  BOOKING: {
    INVALID_STATUS_TRANSITION: "errors.booking.invalid_status_transition",
  },
  REVIEW: {
    INVALID_STATUS_TRANSITION: "errors.review.invalid_status_transition",
  },
} as const;
