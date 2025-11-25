import Joi from "joi";

import { PREFERENCE_CATEGORIES_KEY, VALIDATION_MESSAGES } from "@/constants";

export const categoryKeyParamSchema = Joi.object({
  categoryKey: Joi.string()
    .trim()
    .valid(...Object.values(PREFERENCE_CATEGORIES_KEY))
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.REQUIRED,
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "any.only": VALIDATION_MESSAGES.ONLY,
    }),
});

export const updatePreferenceBodySchema = Joi.object({
  optionKey: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});
