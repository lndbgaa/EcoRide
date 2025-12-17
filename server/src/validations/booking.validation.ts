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
