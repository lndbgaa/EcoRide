export const INCIDENT_ERROR_MESSAGES = {
  INVALID_STATUS_TRANSITION: "errors:incident.invalid_status_transition",

  CREATE: {
    TRIP_NOT_COMPLETED: "errors:incident.create.trip_not_completed",
    ALREADY_REPORTED: "errors:incident.create.already_reported",
  },

  ASSIGN: {
    ALREADY_RESOLVED: "errors:incident.assign.already_resolved",
    ALREADY_ASSIGNED_TO_USER: "errors:incident.assign.already_assigned_to_user",
    ALREADY_ASSIGNED_TO_OTHER: "errors:incident.assign.already_assigned_to_other",
  },

  RESOLVE: {
    ALREADY_RESOLVED: "errors:incident.resolve.already_resolved",
    NOT_ASSIGNED: "errors:incident.resolve.not_assigned",
    ASSIGNED_TO_OTHER: "errors:incident.resolve.assigned_to_other",
  },
} as const;
