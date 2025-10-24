export const ERROR_CODES = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
} as const;

export const ERROR_MESSAGES = {
  COMMON: {
    INTERNAL_SERVER_ERROR: "errors.common.internal_server_error",
    RESOURCE_NOT_FOUND: "errors.common.resource_not_found",
    VALIDATION_ERROR: "errors.common.validation_error",
  },
} as const;
