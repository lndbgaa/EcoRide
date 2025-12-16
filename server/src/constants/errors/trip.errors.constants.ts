export const TRIP_ERROR_MESSAGES = {
  GENERIC: {
    INVALID_STATUS_TRANSITION: "errors:trip.invalid_status_transition",
    INVALID_SEAT_AMOUNT: "errors:trip.invalid_seat_amount",
    CANNOT_MODIFY_SEATS: "errors:trip.cannot_modify_seats",
    EXCEEDS_OFFERED_SEATS: "errors:trip.exceeds_offered_seats",
    NOT_ENOUGH_AVAILABLE_SEATS: "errors:trip.not_enough_available_seats",
  },

  CREATE: {
    INSUFFICIENT_VEHICLE_SEATS: "errors:trip.create.insufficient_vehicle_seats",
  },

  CANCEL: {
    INVALID_STATUS: "errors:trip.cancel.invalid_status",
    TOO_CLOSE: "errors:trip.cancel.too_close",
  },

  START: {
    INVALID_STATUS: "errors:trip.start.invalid_status",
    TOO_EARLY: "errors:trip.start.too_early",
    TOO_LATE: "errors:trip.start.too_late",
  },

  END: {
    INVALID_STATUS: "errors:trip.end.invalid_status",
  },
} as const;
