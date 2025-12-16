import dayjs from "dayjs";
import Joi from "joi";

import { ALLOWED_DATE_FORMATS, VALIDATION_MESSAGES } from "@/constants";

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.guid": VALIDATION_MESSAGES.STRING_UUID,
  }),
});

export const uuidField = Joi.string().uuid().required().messages({
  "any.required": VALIDATION_MESSAGES.REQUIRED,
  "string.base": VALIDATION_MESSAGES.STRING_BASE,
  "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
  "string.guid": VALIDATION_MESSAGES.STRING_UUID,
});

export const dateField = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const parsed = dayjs(value, ALLOWED_DATE_FORMATS, true);

    if (!parsed.isValid()) return helpers.error("date.invalid");

    return parsed.format("YYYY-MM-DD");
  })
  .required()
  .messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "date.invalid": VALIDATION_MESSAGES.DATE_INVALID,
  });

export const timeField = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const parsed = dayjs(value, "HH:mm", true);

    if (!parsed.isValid()) return helpers.error("time.invalid");

    return value;
  })
  .required()
  .messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "time.invalid": VALIDATION_MESSAGES.TIME_INVALID,
  });
