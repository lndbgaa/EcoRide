import Joi from "joi";

import { VALIDATION_MESSAGES } from "@/constants";
import { uuidField } from "@/validations";

export const createBookingBodySchema = Joi.object({
  tripId: uuidField,
  seatsToBook: Joi.number().integer().strict().min(1).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
    "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
    "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
  }),
});

export const reportBookingIncidentBodySchema = Joi.object({
  description: Joi.string().trim().min(10).max(500).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
});
