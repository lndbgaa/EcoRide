export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTERED: "success.auth.registered",
    LOGGED_IN: "success.auth.logged_in",
    REFRESHED: "success.auth.refreshed",
    LOGGED_OUT: "success.auth.logged_out",

    EMAIL_VERIFICATION_SENT: "success.auth.email_verification_sent",
    EMAIL_VERIFIED: "success.auth.email_verified",

    PASSWORD_RESET_SENT: "success.auth.password_reset_sent",
    PASSWORD_RESET_TOKEN_VALID: "success.auth.password_reset_token_valid",
    PASSWORD_RESET_COMPLETED: "success.auth.password_reset_completed",
  },

  USER: {
    PERSONAL_DATA_RETRIEVED: "success.user.personal_data_retrieved",

    PROFILE_UPDATED: "success.user.profile_updated",
    PASSWORD_UPDATED: "success.user.password_updated",
    PICTURE_UPDATED: "success.user.picture_updated",

    DELETION_REQUESTED: "success.user.deletion_requested",
    DELETION_CANCELLED: "success.user.deletion_cancelled",
  },
} as const;
