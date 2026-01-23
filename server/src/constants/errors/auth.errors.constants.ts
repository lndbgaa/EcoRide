export const AUTH_ERROR_CODES = {
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  ACCESS_TOKEN_EXPIRED: "AUTH_ACCESS_TOKEN_EXPIRED",
  USER_ROLE_INVALID: "AUTH_USER_ROLE_INVALID",

  EMAIL_VERIFICATION_FAILED: "AUTH_EMAIL_VERIFICATION_FAILED",
  EMAIL_VERIFICATION_SEND_FAILED: "AUTH_EMAIL_VERIFICATION_SEND_FAILED",

  PASSWORD_RESET_TOKEN_INVALID: "AUTH_PASSWORD_RESET_TOKEN_INVALID",

  ACCOUNT_EMAIL_NOT_VERIFIED: "AUTH_ACCOUNT_EMAIL_NOT_VERIFIED",
  ACCOUNT_PENDING_DELETION: "AUTH_ACCOUNT_PENDING_DELETION",
  ACCOUNT_SUSPENDED: "AUTH_ACCOUNT_SUSPENDED",
} as const;

export const AUTH_ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: "errors:auth.authentication_required",
  USER_ROLE_INVALID: "errors:auth.role_invalid",
  SESSION_INVALID: "errors:auth.session_invalid",
  SESSION_EXPIRED: "errors:auth.session_expired",

  INVALID_CREDENTIALS: "errors:auth.invalid_credentials",

  EMAIL_ALREADY_EXISTS: "errors:auth.email_already_exists",
  USERNAME_ALREADY_EXISTS: "errors:auth.username_already_exists",

  EMAIL_VERIFICATION_FAILED: "errors:auth.email_verification_token_invalid",
  EMAIL_VERIFICATION_SEND_FAILED: "errors:auth.email_verification_send_failed",

  PASSWORD_RESET_SEND_FAILED: "errors:auth.password_reset_send_failed",
  PASSWORD_RESET_TOKEN_INVALID: "errors:auth.password_reset_token_invalid",

  ACCOUNT_EMAIL_ALREADY_VERIFIED: "errors:auth.account_email_already_verified",
  ACCOUNT_EMAIL_NOT_VERIFIED: "errors:auth.account_email_not_verified",
  ACCOUNT_SUSPENDED: "errors:auth.account_suspended",
  ACCOUNT_PENDING_DELETION: "errors:auth.account_pending_deletion",
} as const;
