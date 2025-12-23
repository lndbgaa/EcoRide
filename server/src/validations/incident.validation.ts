import Joi from "joi";

import { INCIDENT_STATUSES, VALIDATION_MESSAGES } from "@/constants";

const { ASSIGNED, RESOLVED } = INCIDENT_STATUSES;

export const resolveIncidentBodySchema = Joi.object({
  note: Joi.string().trim().min(10).max(500).required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.min": VALIDATION_MESSAGES.STRING_MIN,
    "string.max": VALIDATION_MESSAGES.STRING_MAX,
  }),
});

export const getIncidentsQuerySchema = Joi.object({
  sortDir: Joi.string().trim().valid("asc", "desc").optional().messages({
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "any.only": VALIDATION_MESSAGES.ONLY,
  }),
  status: Joi.string()
    .trim()
    .valid(...Object.values(INCIDENT_STATUSES))
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.STRING_BASE,
      "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
      "any.only": VALIDATION_MESSAGES.ONLY,
    }),
});

export const getMyIncidentsQuerySchema = Joi.object({
  status: Joi.string()
    .trim()
    .valid(ASSIGNED, RESOLVED)
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
