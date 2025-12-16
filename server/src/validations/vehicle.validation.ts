import Joi from "joi";

import { REGEX, VALIDATION_MESSAGES, VEHICLE_MAX_SEATS, VEHICLE_MIN_SEATS } from "@/constants";
import { dateField } from "@/validations";
import dayjs from "dayjs";

export const createVehicleBodySchema = Joi.object({
  brandId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  model: Joi.string().trim().max(50).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  colorId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  energyId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  seats: Joi.number().integer().strict().min(VEHICLE_MIN_SEATS).max(VEHICLE_MAX_SEATS).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
    "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
  }),
  licensePlate: Joi.string().trim().required().pattern(REGEX.licensePlate).messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_LICENSE_PLATE,
  }),
  firstRegistrationDate: dateField.concat(
    Joi.string()
      .custom((value, helpers) => {
        const now = dayjs();
        const parsed = dayjs(value);

        if (parsed.isAfter(now, "day")) {
          return helpers.error("vehicle.first_registration_date_cannot_be_future");
        }

        return value;
      })
      .messages({
        "vehicle.first_registration_date_cannot_be_future": VALIDATION_MESSAGES.VEHICLE.FIRST_REGISTRATION_CANNOT_BE_FUTURE,
      })
  ),
});

export const updateVehicleBodySchema = Joi.object({
  brandId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  model: Joi.string().trim().max(50).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  colorId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  energyId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
  firstRegistrationDate: dateField.optional().concat(
    Joi.string()
      .custom((value, helpers) => {
        const parsed = dayjs(value);
        const now = dayjs();

        if (parsed.isAfter(now, "day")) {
          return helpers.error("vehicle.first_registration_date_cannot_be_future");
        }

        return value;
      })
      .messages({
        "vehicle.first_registration_date_cannot_be_future": VALIDATION_MESSAGES.VEHICLE.FIRST_REGISTRATION_CANNOT_BE_FUTURE,
      })
  ),
});
