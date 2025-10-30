export const ERROR_CODES = {
  AUTH: {
    AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
    SESSION_INVALID: "AUTH_SESSION_INVALID",
    ROLE_INVALID: "AUTH_ROLE_INVALID",

    ACCESS_TOKEN_MALFORMED: "AUTH_ACCESS_TOKEN_MALFORMED",
    ACCESS_TOKEN_INVALID: "AUTH_ACCESS_TOKEN_INVALID",
    ACCESS_TOKEN_EXPIRED: "AUTH_ACCESS_TOKEN_EXPIRED",

    EMAIL_VERIFICATION_SEND_FAILED: "AUTH_EMAIL_VERIFICATION_SEND_FAILED",
    EMAIL_VERIFICATION_FAILED: "AUTH_EMAIL_VERIFICATION_FAILED",

    PASSWORD_RESET_TOKEN_INVALID: "AUTH_PASSWORD_RESET_TOKEN_INVALID",

    ACCOUNT_EMAIL_NOT_VERIFIED: "AUTH_ACCOUNT_EMAIL_NOT_VERIFIED",
    ACCOUNT_PENDING_DELETION: "AUTH_ACCOUNT_PENDING_DELETION",
    ACCOUNT_SUSPENDED: "AUTH_ACCOUNT_SUSPENDED",
  },
} as const;

export const ERROR_MESSAGES = {
  COMMON: {
    INTERNAL_SERVER_ERROR: "errors.common.internal_server_error",
    RESOURCE_NOT_FOUND: "errors.common.resource_not_found",
    VALIDATION_ERROR: "errors.common.validation_error",
  },

  RATE_LIMIT: {
    DEFAULT: "errors.rate_limit.default",
    REGISTER: "errors.rate_limit.register",
    LOGIN: "errors.rate_limit.login",
    PASSWORD_RESET: "errors.rate_limit.password_reset",
  },

  AUTH: {
    AUTHENTICATION_REQUIRED: "errors.auth.authentication_required",
    INVALID_CREDENTIALS: "errors.auth.invalid_credentials",
    ROLE_INVALID: "errors.auth.role_invalid",
    SESSION_INVALID: "errors.auth.session_invalid",

    EMAIL_ALREADY_EXISTS: "errors.auth.email_already_exists",
    USERNAME_ALREADY_EXISTS: "errors.auth.username_already_exists",

    EMAIL_VERIFICATION_FAILED: "errors.auth.email_verification_token_invalid",
    EMAIL_VERIFICATION_SEND_FAILED: "errors.auth.email_verification_send_failed",

    PASSWORD_RESET_SEND_FAILED: "errors.auth.password_reset_send_failed",
    PASSWORD_RESET_TOKEN_INVALID: "errors.auth.password_reset_token_invalid",

    ACCOUNT_EMAIL_ALREADY_VERIFIED: "errors.auth.account_email_already_verified",
    ACCOUNT_EMAIL_NOT_VERIFIED: "errors.auth.account_email_not_verified",
    ACCOUNT_SUSPENDED: "errors.auth.account_suspended",
    ACCOUNT_PENDING_DELETION: "errors.auth.account_pending_deletion",
  },
  USER: {
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
