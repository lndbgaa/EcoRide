import dayjs from "dayjs";
import Joi from "joi";

import { ALLOWED_DATE_FORMATS, REGEX, VALIDATION_MESSAGES, VEHICLE_MAX_SEATS, VEHICLE_MIN_SEATS } from "@/constants";

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
  firstRegistrationDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, ALLOWED_DATE_FORMATS, true);
      if (!parsed.isValid()) return helpers.error("date.invalid");
      if (!parsed.isBefore(now)) return helpers.error("date.before_now");
      return parsed.format("YYYY-MM-DD");
    })
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.REQUIRED,
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "date.invalid": VALIDATION_MESSAGES.DATE_INVALID,
      "date.before_now": VALIDATION_MESSAGES.DATE_BEFORE_NOW,
    }),
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
  firstRegistrationDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, ALLOWED_DATE_FORMATS, true);
      if (!parsed.isValid()) return helpers.error("date.invalid");
      if (!parsed.isBefore(now)) return helpers.error("date.before_now");
      return parsed.format("YYYY-MM-DD");
    })
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "date.invalid": VALIDATION_MESSAGES.DATE_INVALID,
      "date.before_now": VALIDATION_MESSAGES.DATE_BEFORE_NOW,
    }),
});
