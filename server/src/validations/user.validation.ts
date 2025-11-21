import dayjs from "dayjs";
import Joi from "joi";

import { ALLOWED_DATE_FORMATS, MINIMUM_USER_AGE, REGEX, VALIDATION_MESSAGES } from "@/constants";

export const updateUserPasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required().messages({
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

export const updateUserInfoSchema = Joi.object({
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_USERNAME,
  }),
  firstName: Joi.string().trim().min(2).max(50).pattern(REGEX.firstName).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_FIRST_NAME,
  }),
  lastName: Joi.string().trim().min(2).max(50).pattern(REGEX.lastName).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_LAST_NAME,
  }),
  phone: Joi.string().trim().pattern(REGEX.phoneFR).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_PHONE,
  }),
  address: Joi.string().trim().min(5).max(150).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  birthDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, ALLOWED_DATE_FORMATS, true);

      if (!parsed.isValid()) return helpers.error("date.invalid");
      if (!parsed.isBefore(now)) return helpers.error("date.before_now");
      if (parsed.isAfter(now.subtract(MINIMUM_USER_AGE, "year"))) {
        return helpers.error("date.too_young");
      }

      return parsed.format("YYYY-MM-DD");
    })
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "date.invalid": VALIDATION_MESSAGES.DATE_INVALID,
      "date.before_now": VALIDATION_MESSAGES.DATE_BEFORE_NOW,
      "date.too_young": VALIDATION_MESSAGES.DATE_TOO_YOUNG,
    }),
});
