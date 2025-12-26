import Joi from "joi";

import {
  REVIEW_MAX_RATING,
  REVIEW_MIN_RATING,
  VALIDATION_MESSAGES,
} from "@/constants";
import { uuidField } from "@/validations";

export const createReviewBodySchema = Joi.object({
  tripId: uuidField,
  rating: Joi.number()
    .integer()
    .min(REVIEW_MIN_RATING)
    .max(REVIEW_MAX_RATING)
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.REQUIRED,
      "number.base": VALIDATION_MESSAGES.NUMBER_BASE,
      "number.integer": VALIDATION_MESSAGES.NUMBER_INTEGER,
      "number.min": VALIDATION_MESSAGES.NUMBER_MIN,
      "number.max": VALIDATION_MESSAGES.NUMBER_MAX,
    }),
  comment: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .empty("")
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.min": VALIDATION_MESSAGES.STRING_MIN,
      "string.max": VALIDATION_MESSAGES.STRING_MAX,
    }),
});
