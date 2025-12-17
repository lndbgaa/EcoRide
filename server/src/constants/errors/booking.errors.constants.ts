export const BOOKING_ERROR_MESSAGES = {
  GENERIC: {
    INVALID_STATUS_TRANSITION: "errors:booking.invalid_status_transition",
  },

  CREATE: {
    TRIP_NOT_OPEN: "errors:booking.create.trip_not_open",
    IS_DRIVER: "errors:booking.create.is_driver",
    ALREADY_BOOKED: "errors:booking.create.already_booked",
    NOT_ENOUGH_SEATS: "errors:booking.create.not_enough_seats",
    INSUFFICIENT_CREDITS: "errors:booking.create.insufficient_credits",
  },

  CANCEL: {
    ALREADY_CANCELLED: "errors:booking.cancel.already_cancelled",
    INVALID_STATUS: "errors:booking.cancel.invalid_status",
    TOO_CLOSE: "errors:booking.cancel.too_close",
  },
} as const;
