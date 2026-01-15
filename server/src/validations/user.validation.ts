import dayjs from "dayjs";
import Joi from "joi";

import {
  MINIMUM_USER_AGE,
  REGEX,
  USER_FILTERABLE_STATUSES,
  USER_ROLES_KEY,
  USER_SORT_FIELDS,
  VALIDATION_MESSAGES,
} from "@/constants";
import { dateField } from "@/validations";

const { USER, MODERATOR } = USER_ROLES_KEY;

export const updateUserPasswordBodySchema = Joi.object({
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

export const updateUserInfoBodySchema = Joi.object({
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
  phone: Joi.string().trim().pattern(REGEX.phoneFR).allow("", null).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.pattern.base": VALIDATION_MESSAGES.PATTERN_PHONE,
  }),
  address: Joi.string().trim().min(5).max(150).allow("", null).optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
  birthDate: dateField.optional().concat(
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

export const updateUserRoleBodySchema = Joi.object({
  role: Joi.string().valid(USER, MODERATOR).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "any.only": VALIDATION_MESSAGES.ONLY,
  }),
});

export const getUsersQuerySchema = Joi.object({
  role: Joi.string()
    .trim()
    .valid(...Object.values(USER_ROLES_KEY))
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "any.only": VALIDATION_MESSAGES.ONLY,
    }),
  status: Joi.string()
    .trim()
    .valid(...USER_FILTERABLE_STATUSES)
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "any.only": VALIDATION_MESSAGES.ONLY,
    }),
  search: Joi.string().trim().optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "any.only": VALIDATION_MESSAGES.ONLY,
  }),
  sortBy: Joi.string()
    .trim()
    .valid(...USER_SORT_FIELDS)
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "any.only": VALIDATION_MESSAGES.ONLY,
    }),
  sortDir: Joi.string().trim().valid("asc", "desc").optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "any.only": VALIDATION_MESSAGES.ONLY,
  }),
});
