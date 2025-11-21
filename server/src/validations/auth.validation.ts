import dayjs from "dayjs";
import Joi from "joi";

import { ALLOWED_DATE_FORMATS, MINIMUM_USER_AGE, REGEX, VALIDATION_MESSAGES } from "@/constants";

const emailField = Joi.string().trim().lowercase().email().required().messages({
  "any.required": VALIDATION_MESSAGES.REQUIRED,
  "string.base": VALIDATION_MESSAGES.STRING_BASE,
  "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  "string.email": VALIDATION_MESSAGES.STRING_EMAIL,
});

const strongPasswordField = Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
  "any.required": VALIDATION_MESSAGES.REQUIRED,
  "string.base": VALIDATION_MESSAGES.STRING_BASE,
  "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  "string.min": VALIDATION_MESSAGES.STRING_MIN,
  "string.pattern.base": VALIDATION_MESSAGES.PATTERN_PASSWORD,
});

export const registerSchema = Joi.object({
  email: emailField,
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_USERNAME,
  }),
  password: strongPasswordField,
  firstName: Joi.string().trim().min(2).max(50).pattern(REGEX.firstName).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_FIRST_NAME,
  }),
  lastName: Joi.string().trim().min(2).max(50).pattern(REGEX.lastName).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_LAST_NAME,
  }),
  birthDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, ALLOWED_DATE_FORMATS, true);

      if (!parsed.isValid()) return helpers.error("date.invalid");
      if (!parsed.isBefore(now)) return helpers.error("date.before_now");
      if (parsed.isAfter(now.subtract(MINIMUM_USER_AGE, "year"))) {
        return helpers.error("date.too_young", { minAge: MINIMUM_USER_AGE });
      }

      return parsed.format("YYYY-MM-DD");
    })
    .required()
    .messages({
      "any.required": VALIDATION_MESSAGES.REQUIRED,
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "date.invalid": VALIDATION_MESSAGES.DATE_INVALID,
      "date.before_now": VALIDATION_MESSAGES.DATE_BEFORE_NOW,
      "date.too_young": VALIDATION_MESSAGES.DATE_TOO_YOUNG,
    }),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});

export const resendVerificationSchema = Joi.object({
  email: emailField,
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});

export const requestPasswordResetSchema = Joi.object({
  email: emailField,
});

export const verifyResetTokenSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
  password: strongPasswordField,
});
