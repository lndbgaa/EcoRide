export const AUTH_VALIDATION_ERROR_MESSAGES = {
  EMAIL: {
    REQUIRED: "validation.auth.email_required",
    BASE: "validation.auth.email_base",
    EMPTY: "validation.auth.email_empty",
    INVALID: "validation.auth.email_invalid",
  },

  PASSWORD: {
    REQUIRED: "validation.auth.password_required",
    BASE: "validation.auth.password_base",
    EMPTY: "validation.auth.password_empty",
    MIN: "validation.auth.password_min",
    INVALID: "validation.auth.password_invalid",
  },

  USERNAME: {
    REQUIRED: "validation.auth.username_required",
    BASE: "validation.auth.username_base",
    EMPTY: "validation.auth.username_empty",
    MIN: "validation.auth.username_min",
    MAX: "validation.auth.username_max",
    INVALID: "validation.auth.username_invalid",
  },

  FIRST_NAME: {
    REQUIRED: "validation.auth.first_name_required",
    BASE: "validation.auth.first_name_base",
    EMPTY: "validation.auth.first_name_empty",
    MIN: "validation.auth.first_name_min",
    MAX: "validation.auth.first_name_max",
    INVALID: "validation.auth.first_name_invalid",
  },

  LAST_NAME: {
    REQUIRED: "validation.auth.last_name_required",
    BASE: "validation.auth.last_name_base",
    EMPTY: "validation.auth.last_name_empty",
    MIN: "validation.auth.last_name_min",
    MAX: "validation.auth.last_name_max",
    INVALID: "validation.auth.last_name_invalid",
  },

  EMAIL_VERIFICATION_TOKEN: {
    REQUIRED: "validation.auth.email_verification_token_required",
    BASE: "validation.auth.email_verification_token_base",
    EMPTY: "validation.auth.email_verification_token_empty",
  },

  PASSWORD_RESET_TOKEN: {
    REQUIRED: "validation.auth.password_reset_token_required",
    BASE: "validation.auth.password_reset_token_base",
    EMPTY: "validation.auth.password_reset_token_empty",
  },
} as const;
