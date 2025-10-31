import dayjs from "dayjs";
import Joi from "joi";

import { REGEX, USER_VALIDATION_ERROR_MESSAGES } from "@/constants";

export const updateUserPasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required().messages({
    "any.required": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.CURRENT_REQUIRED,
    "string.base": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.CURRENT_BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.CURRENT_EMPTY,
  }),
  newPassword: Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
    "any.required": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.NEW_REQUIRED,
    "string.base": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.NEW_BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.NEW_EMPTY,
    "string.min": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.NEW_MIN,
    "string.pattern.base": USER_VALIDATION_ERROR_MESSAGES.PASSWORD.NEW_INVALID,
  }),
});

export const updateUserInfoSchema = Joi.object({
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).optional().messages({
    "string.base": USER_VALIDATION_ERROR_MESSAGES.USERNAME.BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.USERNAME.EMPTY,
    "string.min": USER_VALIDATION_ERROR_MESSAGES.USERNAME.MIN,
    "string.max": USER_VALIDATION_ERROR_MESSAGES.USERNAME.MAX,
    "string.pattern.base": USER_VALIDATION_ERROR_MESSAGES.USERNAME.INVALID,
  }),
  firstName: Joi.string().trim().min(2).max(50).pattern(REGEX.firstName).optional().messages({
    "string.base": USER_VALIDATION_ERROR_MESSAGES.FIRST_NAME.BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.FIRST_NAME.EMPTY,
    "string.min": USER_VALIDATION_ERROR_MESSAGES.FIRST_NAME.MIN,
    "string.max": USER_VALIDATION_ERROR_MESSAGES.FIRST_NAME.MAX,
    "string.pattern.base": USER_VALIDATION_ERROR_MESSAGES.FIRST_NAME.INVALID,
  }),
  lastName: Joi.string().trim().min(2).max(50).pattern(REGEX.lastName).optional().messages({
    "string.base": USER_VALIDATION_ERROR_MESSAGES.LAST_NAME.BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.LAST_NAME.EMPTY,
    "string.min": USER_VALIDATION_ERROR_MESSAGES.LAST_NAME.MIN,
    "string.max": USER_VALIDATION_ERROR_MESSAGES.LAST_NAME.MAX,
    "string.pattern.base": USER_VALIDATION_ERROR_MESSAGES.LAST_NAME.INVALID,
  }),
  phone: Joi.string().trim().pattern(REGEX.phoneFR).optional().messages({
    "string.base": USER_VALIDATION_ERROR_MESSAGES.PHONE.BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.PHONE.EMPTY,
    "string.pattern.base": USER_VALIDATION_ERROR_MESSAGES.PHONE.INVALID,
  }),
  address: Joi.string().trim().min(5).max(150).optional().messages({
    "string.base": USER_VALIDATION_ERROR_MESSAGES.ADDRESS.BASE,
    "string.empty": USER_VALIDATION_ERROR_MESSAGES.ADDRESS.EMPTY,
    "string.min": USER_VALIDATION_ERROR_MESSAGES.ADDRESS.MIN,
    "string.max": USER_VALIDATION_ERROR_MESSAGES.ADDRESS.MAX,
  }),
  birthDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, "YYYY-MM-DD", true);

      if (!parsed.isValid() || !parsed.isBefore(now)) {
        return helpers.error("any.invalid");
      }

      return value;
    })
    .optional()
    .messages({
      "string.base": USER_VALIDATION_ERROR_MESSAGES.BIRTHDATE.BASE,
      "string.empty": USER_VALIDATION_ERROR_MESSAGES.BIRTHDATE.EMPTY,
      "any.invalid": USER_VALIDATION_ERROR_MESSAGES.BIRTHDATE.INVALID,
    }),
});
