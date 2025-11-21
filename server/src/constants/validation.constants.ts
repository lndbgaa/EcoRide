export const MINIMUM_USER_AGE = 18;

export const ALLOWED_DATE_FORMATS = ["YYYY-MM-DD", "YYYY/MM/DD", "DD/MM/YYYY", "MM-DD-YYYY"];

export const VALIDATION_MESSAGES = {
  REQUIRED: "validation.required",

  STRING_BASE: "validation.string_base",
  STRING_EMPTY: "validation.string_empty",
  STRING_MIN: "validation.string_min",
  STRING_MAX: "validation.string_max",
  STRING_EMAIL: "validation.string_email",
  STRING_UUID: "validation.string_uuid",

  NUMBER_BASE: "validation.number_base",
  NUMBER_INTEGER: "validation.number_integer",
  NUMBER_MIN: "validation.number_min",
  NUMBER_MAX: "validation.number_max",

  DATE_INVALID: "validation.date_invalid",
  DATE_BEFORE_NOW: "validation.date_before_now",
  DATE_TOO_YOUNG: "validation.date_too_young",

  PATTERN_USERNAME: "validation.pattern_username",
  PATTERN_PASSWORD: "validation.pattern_password",
  PATTERN_FIRST_NAME: "validation.pattern_first_name",
  PATTERN_LAST_NAME: "validation.pattern_last_name",
  PATTERN_PHONE: "validation.pattern_phone",
  PATTERN_LICENSE_PLATE: "validation.pattern_license_plate",
} as const;
