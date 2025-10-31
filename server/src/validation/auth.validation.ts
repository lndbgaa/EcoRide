import Joi from "joi";

import { AUTH_VALIDATION_ERROR_MESSAGES, REGEX } from "@/constants";

const emailField = Joi.string().trim().lowercase().email().required().messages({
  "any.required": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL.REQUIRED,
  "string.base": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL.BASE,
  "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL.EMPTY,
  "string.email": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL.INVALID,
});

const strongPasswordField = Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
  "any.required": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.REQUIRED,
  "string.base": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.BASE,
  "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.EMPTY,
  "string.min": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.MIN,
  "string.pattern.base": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.INVALID,
});

export const registerSchema = Joi.object({
  email: emailField,
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.EMPTY,
    "string.min": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.MIN,
    "string.max": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.MAX,
    "string.pattern.base": AUTH_VALIDATION_ERROR_MESSAGES.USERNAME.INVALID,
  }),
  password: strongPasswordField,
  firstName: Joi.string().trim().min(2).max(50).pattern(REGEX.firstName).required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.EMPTY,
    "string.min": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.MIN,
    "string.max": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.MAX,
    "string.pattern.base": AUTH_VALIDATION_ERROR_MESSAGES.FIRST_NAME.INVALID,
  }),
  lastName: Joi.string().trim().min(2).max(50).pattern(REGEX.lastName).required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.EMPTY,
    "string.min": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.MIN,
    "string.max": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.MAX,
    "string.pattern.base": AUTH_VALIDATION_ERROR_MESSAGES.LAST_NAME.INVALID,
  }),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().trim().required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD.EMPTY,
  }),
});

export const resendVerificationSchema = Joi.object({
  email: emailField,
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL_VERIFICATION_TOKEN.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL_VERIFICATION_TOKEN.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.EMAIL_VERIFICATION_TOKEN.EMPTY,
  }),
});

export const requestPasswordResetSchema = Joi.object({
  email: emailField,
});

export const verifyResetTokenSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.EMPTY,
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.REQUIRED,
    "string.base": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.BASE,
    "string.empty": AUTH_VALIDATION_ERROR_MESSAGES.PASSWORD_RESET_TOKEN.EMPTY,
  }),
  password: strongPasswordField,
});
