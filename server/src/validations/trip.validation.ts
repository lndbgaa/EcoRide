import Joi from "joi";

import { dayjs } from "@/config";
import {
  REVIEW_MAX_RATING,
  REVIEW_MIN_RATING,
  TRIP_MAX_DURATION_MINUTES,
  TRIP_MAX_PRICE,
  TRIP_MAX_SEATS,
  TRIP_MIN_DURATION_MINUTES,
  TRIP_MIN_PRICE,
  TRIP_MIN_SEATS,
  VALIDATION_MESSAGES,
} from "@/constants";
import { dateField, timeField, uuidField } from "@/validations";

export const searchTripsBodySchema = Joi.object({
  from: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
  to: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
  date: dateField
    .concat(
      Joi.string().custom((value, helpers) => {
        const now = dayjs();
        const parsed = dayjs(value);

        if (parsed.isBefore(now, "day")) {
          return helpers.error("trip.search_date_cannot_be_past");
        }

        return value;
      })
    )
    .messages({
      "trip.search_date_cannot_be_past": VALIDATION_MESSAGES.TRIP.SEARCH_DATE_CANNOT_BE_PAST,
    }),
  seats: Joi.number().integer().min(TRIP_MIN_SEATS).max(TRIP_MAX_SEATS).optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
    "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
  }),
  maxPrice: Joi.number().integer().min(1).optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  maxDuration: Joi.number().integer().min(1).optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  minRating: Joi.number().min(REVIEW_MIN_RATING).max(REVIEW_MAX_RATING).optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
    "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
  }),
  ecoFriendly: Joi.boolean().optional().messages({
    "boolean.base": VALIDATION_MESSAGES.BOOLEAN_BASE,
  }),
});

export const createTripBodySchema = Joi.object({
  departureLocation: Joi.string().trim().max(150).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  arrivalLocation: Joi.string().trim().max(150).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  departureDate: dateField,
  departureTime: timeField,
  arrivalDate: dateField,
  arrivalTime: timeField,
  vehicleId: uuidField,
  price: Joi.number().integer().strict().min(TRIP_MIN_PRICE).max(TRIP_MAX_PRICE).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
    "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
  }),
  offeredSeats: Joi.number().integer().strict().min(TRIP_MIN_SEATS).max(TRIP_MAX_SEATS).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
    "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
  }),
})
  .custom((value, helpers) => {
    if (value.departureLocation === value.arrivalLocation) {
      return helpers.error("trip.same_locations");
    }

    const departure = dayjs(`${value.departureDate}T${value.departureTime}`);
    const arrival = dayjs(`${value.arrivalDate}T${value.arrivalTime}`);

    if (!departure.isValid() || !arrival.isValid()) {
      return helpers.error("datetime.invalid");
    }

    if (departure.isBefore(dayjs())) {
      return helpers.error("trip.departure_cannot_be_past");
    }

    const durationMinutes = arrival.diff(departure, "minute");

    if (durationMinutes <= 0) {
      return helpers.error("trip.arrival_before_departure");
    }

    if (durationMinutes < TRIP_MIN_DURATION_MINUTES) {
      return helpers.error("trip.duration_too_short", {
        minDuration: TRIP_MIN_DURATION_MINUTES,
      });
    }

    if (durationMinutes > TRIP_MAX_DURATION_MINUTES) {
      return helpers.error("trip.duration_too_long", {
        maxDuration: TRIP_MAX_DURATION_MINUTES / 60,
      });
    }

    return value;
  })
  .messages({
    "trip.same_locations": VALIDATION_MESSAGES.TRIP.SAME_LOCATIONS,
    "datetime.invalid": VALIDATION_MESSAGES.DATETIME_INVALID,
    "trip.departure_cannot_be_past": VALIDATION_MESSAGES.TRIP.DEPARTURE_CANNOT_BE_PAST,
    "trip.arrival_before_departure": VALIDATION_MESSAGES.TRIP.ARRIVAL_BEFORE_DEPARTURE,
    "trip.duration_too_short": VALIDATION_MESSAGES.TRIP.DURATION_TOO_SHORT,
    "trip.duration_too_long": VALIDATION_MESSAGES.TRIP.DURATION_TOO_LONG,
  });
