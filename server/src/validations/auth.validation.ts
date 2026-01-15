import { dayjs } from "@/config";
import Joi from "joi";

import { MINIMUM_USER_AGE, REGEX, VALIDATION_MESSAGES } from "@/constants";
import { dateField } from "@/validations";

export const registerUserBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.email": VALIDATION_MESSAGES.STRING_EMAIL,
  }),
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_USERNAME,
  }),
  password: Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_PASSWORD,
  }),
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
  birthDate: dateField.concat(
    Joi.string()
      .custom((value, helpers) => {
        const now = dayjs();
        const parsed = dayjs(value);

        if (parsed.isAfter(now, "day")) {
          return helpers.error("user.birth_cannot_be_future");
        }

        if (parsed.isAfter(now.subtract(MINIMUM_USER_AGE, "year"))) {
          return helpers.error("user.too_young", {
            minAge: MINIMUM_USER_AGE,
          });
        }

        return value;
      })
      .messages({
        "user.birth_cannot_be_future": VALIDATION_MESSAGES.USER.BIRTH_CANNOT_BE_FUTURE,
        "user.too_young": VALIDATION_MESSAGES.USER.TOO_YOUNG,
      })
  ),
});

export const loginUserBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.email": VALIDATION_MESSAGES.STRING_EMAIL,
  }),
  password: Joi.string().trim().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  }),
});
