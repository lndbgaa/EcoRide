import Joi from "joi";

import { REGEX, VALIDATION_MESSAGES } from "@/constants";

export const requestUserPasswordResetBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.email": VALIDATION_MESSAGES.STRING_EMAIL,
  }),
});

export const verifyUserResetTokenBodySchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});

export const resetUserPasswordBodySchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
  newPassword: Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_PASSWORD,
  }),
});
