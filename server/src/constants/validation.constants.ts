export const MINIMUM_USER_AGE = 18;

export const ALLOWED_DATE_FORMATS = ["YYYY-MM-DD", "YYYY/MM/DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY"];

export const VALIDATION_MESSAGES = {
  REQUIRED: "validation:required",
  ONLY: "validation:only",

  STRING_BASE: "validation:string_base",
  STRING_EMPTY: "validation:string_empty",
  STRING_MIN: "validation:string_min",
  STRING_MAX: "validation:string_max",
  STRING_EMAIL: "validation:string_email",
  STRING_UUID: "validation:string_uuid",

  NUMBER_BASE: "validation:number_base",
  NUMBER_INTEGER: "validation:number_integer",
  NUMBER_MIN: "validation:number_min",
  NUMBER_MAX: "validation:number_max",

  BOOLEAN_BASE: "validation:boolean_base",

  DATE_INVALID: "validation:date_invalid",
  TIME_INVALID: "validation:time_invalid",
  DATETIME_INVALID: "validation:datetime_invalid",

  PATTERN_USERNAME: "validation:pattern_username",
  PATTERN_PASSWORD: "validation:pattern_password",
  PATTERN_FIRST_NAME: "validation:pattern_first_name",
  PATTERN_LAST_NAME: "validation:pattern_last_name",
  PATTERN_PHONE: "validation:pattern_phone",
  PATTERN_LICENSE_PLATE: "validation:pattern_license_plate",

  USER: {
    BIRTH_CANNOT_BE_FUTURE: "validation:user.birth_cannot_be_future",
    TOO_YOUNG: "validation:user.too_young",
  },

  VEHICLE: {
    FIRST_REGISTRATION_CANNOT_BE_FUTURE: "validation:vehicle.first_registration_cannot_be_future",
  },

  TRIP: {
    SEARCH_DATE_CANNOT_BE_PAST: "validation:trip.search_date_cannot_be_past",
    SAME_LOCATIONS: "validation:trip.same_locations",
    DEPARTURE_CANNOT_BE_PAST: "validation:trip.departure_cannot_be_past",
    ARRIVAL_BEFORE_DEPARTURE: "validation:trip.arrival_before_departure",
    DURATION_TOO_SHORT: "validation:trip.duration_too_short",
    DURATION_TOO_LONG: "validation:trip.duration_too_long",
  },
} as const;
