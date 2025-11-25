export const COMMON_ERROR_CODES = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export const COMMON_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "errors:common.internal_server_error",
  VALIDATION_ERROR: "errors:common.validation_error",
  FORBIDDEN_ACCESS: "errors:common.forbidden_access",
  RESOURCE_NOT_FOUND: "errors:common.resource_not_found",

  NO_CHANGES_DETECTED: "errors:common.no_changes_detected",

  RATE_LIMIT: {
    DEFAULT: "errors:rate_limit.default",
    REGISTER: "errors:rate_limit.register",
    LOGIN: "errors:rate_limit.login",
    PASSWORD_RESET: "errors:rate_limit.password_reset",
  },

  UPLOAD: {
    IMAGE: {
      FILE_MISSING: "errors:upload.image.file_missing",
      FAILED: "errors:upload.image.upload_failed",
    },
  },
} as const;
