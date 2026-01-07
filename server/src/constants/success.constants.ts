export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTERED: "success:auth.registered",
    LOGGED_IN: "success:auth.logged_in",
    REFRESHED: "success:auth.refreshed",
    LOGGED_OUT: "success:auth.logged_out",
    EMAIL_VERIFICATION_SENT: "success:auth.email_verification_sent",
    EMAIL_VERIFIED: "success:auth.email_verified",
    PASSWORD_RESET_SENT: "success:auth.password_reset_sent",
    PASSWORD_RESET_TOKEN_VALID: "success:auth.password_reset_token_valid",
    PASSWORD_RESET_COMPLETED: "success:auth.password_reset_completed",
  },

  USER: {
    DATA_RETRIEVED: "success:user.data_retrieved",
    PROFILE_UPDATED: "success:user.profile_updated",
    PASSWORD_UPDATED: "success:user.password_updated",
    PICTURE_UPDATED: "success:user.picture_updated",
    DELETION_REQUESTED: "success:user.deletion_requested",
    DELETION_CANCELLED: "success:user.deletion_cancelled",
  },

  PREFERENCE: {
    RETRIEVED_ALL: "success:preference.retrieved_all",
    RETRIEVED: "success:preference.retrieved",
    UPDATED: "success:preference.updated",
  },

  VEHICLE: {
    RETRIEVED_ALL: "success:vehicle.retrieved_all",
    RETRIEVED: "success:vehicle.retrieved",
    CREATED: "success:vehicle.created",
    UPDATED: "success:vehicle.updated",
    DELETED: "success:vehicle.deleted",
  },

  TRIP: {
    RETRIEVED_ALL: "success:trip.retrieved_all",
    RETRIEVED: "success:trip.retrieved",
    CREATED: "success:trip.created",
    CANCELLED: "success:trip.cancelled",
    STARTED: "success:trip.started",
    ENDED: "success:trip.ended",
  },

  BOOKING: {
    RETRIEVED_ALL: "success:booking.retrieved_all",
    CREATED: "success:booking.created",
    CANCELLED: "success:booking.cancelled",
    COMPLETED: "success:booking.completed",
    INCIDENT_REPORTED: "success:booking.incident_reported",
  },

  INCIDENT: {
    RETRIEVED_ALL: "success:incident.retrieved_all",
    RETRIEVED: "success:incident.retrieved",
    CREATED: "success:incident.created",
    ASSIGNED: "success:incident.assigned",
    RESOLVED: "success:incident.resolved",
  },

  REVIEW: {
    RETRIEVED_ALL: "success:review.retrieved_all",
    CREATED: "success:review.created",
    APPROVED: "success:review.approved",
    REJECTED: "success:review.rejected",
  },
} as const;
