export const USER_VALIDATION_ERROR_MESSAGES = {
  USERNAME: {
    BASE: "validation.user.username_base",
    EMPTY: "validation.user.username_empty",
    MIN: "validation.user.username_min",
    MAX: "validation.user.username_max",
    INVALID: "validation.user.username_invalid",
  },

  FIRST_NAME: {
    BASE: "validation.user.first_name_base",
    EMPTY: "validation.user.first_name_empty",
    MIN: "validation.user.first_name_min",
    MAX: "validation.user.first_name_max",
    INVALID: "validation.user.first_name_invalid",
  },

  LAST_NAME: {
    BASE: "validation.user.last_name_base",
    EMPTY: "validation.user.last_name_empty",
    MIN: "validation.user.last_name_min",
    MAX: "validation.user.last_name_max",
    INVALID: "validation.user.last_name_invalid",
  },

  PHONE: {
    BASE: "validation.user.phone_base",
    EMPTY: "validation.user.phone_empty",
    INVALID: "validation.user.phone_invalid",
  },

  ADDRESS: {
    BASE: "validation.user.address_base",
    EMPTY: "validation.user.address_empty",
    MIN: "validation.user.address_min",
    MAX: "validation.user.address_max",
  },

  BIRTHDATE: {
    BASE: "validation.user.birthdate_base",
    EMPTY: "validation.user.birthdate_empty",
    INVALID: "validation.user.birthdate_invalid",
  },

  PASSWORD: {
    CURRENT_REQUIRED: "validation.user.current_password_required",
    CURRENT_BASE: "validation.user.current_password_base",
    CURRENT_EMPTY: "validation.user.current_password_empty",

    NEW_REQUIRED: "validation.user.new_password_required",
    NEW_BASE: "validation.user.new_password_base",
    NEW_EMPTY: "validation.user.new_password_empty",
    NEW_MIN: "validation.user.new_password_min",
    NEW_INVALID: "validation.user.new_password_invalid",
  },
} as const;
