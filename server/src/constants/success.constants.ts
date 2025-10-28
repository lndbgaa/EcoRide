export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTRATION_SUCCESS: "success.auth.registration_success",
    LOGIN_SUCCESS: "success.auth.login_success",
    REFRESH_SUCCESS: "success.auth.refresh_success",
    LOGOUT_SUCCESS: "success.auth.logout_success",

    EMAIL_VERIFICATION: {
      SENT: "success.auth.email_verification_sent",
      SUCCESS: "success.auth.email_verification_success",
    },

    PASSWORD_RESET: {
      SENT: "success.auth.password_reset_sent",
      TOKEN_VALID: "success.auth.password_reset_token_valid",
      SUCCESS: "success.auth.password_reset_success",
    },
  },
} as const;
