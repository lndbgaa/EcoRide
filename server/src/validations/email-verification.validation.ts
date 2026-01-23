import Joi from "joi";

import { VALIDATION_MESSAGES } from "@/constants";

export const verifyUserEmailBodySchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});

export const resendEmailVerificationBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.email": VALIDATION_MESSAGES.STRING_EMAIL,
  }),
});


