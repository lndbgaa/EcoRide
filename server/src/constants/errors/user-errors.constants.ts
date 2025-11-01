export const USER_ERROR_MESSAGES = {
  UPDATE_NO_CHANGES: "errors.user.update_no_changes",
  BIRTHDATE_CANNOT_BE_NULLIFIED: "errors.user.birthdate_cannot_be_nullified",
  PHONE_CANNOT_BE_NULLIFIED: "errors.user.phone_cannot_be_nullified",
  CURRENT_PASSWORD_INCORRECT: "errors.user.current_password_incorrect",
  NEW_PASSWORD_SAME_AS_OLD: "errors.user.new_password_same_as_old",
  PROFILE_PICTURE_INVALID_FILE_TYPE: "errors.user.profile_picture_invalid_file_type",
  PROFILE_PICTURE_FILE_TOO_LARGE: "errors.user.profile_picture_file_too_large",

  DELETION_ALREADY_REQUESTED: "errors.user.deletion_already_requested",
  NO_DELETION_REQUESTED: "errors.user.no_deletion_requested",
  DELETION_PERIOD_EXPIRED: "errors.user.deletion_period_expired",

  INVALID_STATUS_TRANSITION: "errors.user.invalid_status_transition",
  INVALID_CREDIT_AMOUNT: "errors.user.invalid_credit_amount",
  INSUFFICIENT_CREDITS: "errors.user.insufficient_credits",
} as const;
