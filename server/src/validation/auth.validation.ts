import Joi from "joi";

import { REGEX } from "@/constants";

const emailField = Joi.string().trim().lowercase().email().required().messages({
  "any.required": "Email is required.",
  "string.empty": "Email must be a non-empty string.",
  "string.email": "Email must be a valid email address.",
});

const strongPasswordField = Joi.string().trim().min(8).pattern(REGEX.password).required().messages({
  "any.required": "Password is required.",
  "string.empty": "Password must be a non-empty string.",
  "string.min": "Password must be at least 8 characters long.",
  "string.pattern.base":
    "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.",
});

export const registerSchema = Joi.object({
  email: emailField,
  username: Joi.string().trim().min(3).max(20).pattern(REGEX.username).required().messages({
    "any.required": "Username is required.",
    "string.empty": "Username must be a non-empty string.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must not exceed 20 characters.",
    "string.pattern.base":
      "Username must start with a letter and contain only letters, numbers, dashes, and underscores.",
  }),
  password: strongPasswordField,
  firstName: Joi.string().trim().min(2).max(50).pattern(REGEX.firstName).required().messages({
    "any.required": "First name is required.",
    "string.empty": "First name must be a non-empty string.",
    "string.min": "First name must be at least 2 characters long.",
    "string.max": "First name must not exceed 50 characters.",
    "string.pattern.base":
      "First name must start with a letter and contain only letters, spaces, apostrophes, or dashes.",
  }),
  lastName: Joi.string().trim().min(2).max(50).pattern(REGEX.lastName).required().messages({
    "any.required": "Last name is required.",
    "string.empty": "Last name must be a non-empty string.",
    "string.min": "Last name must be at least 2 characters long.",
    "string.max": "Last name must not exceed 50 characters.",
    "string.pattern.base":
      "Last name must start with a letter and contain only letters, spaces, apostrophes, or dashes.",
  }),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().trim().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password must be a non-empty string.",
  }),
});

export const resendVerificationSchema = Joi.object({
  email: emailField,
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Email verification token is required.",
    "string.empty": "Email verification token is required.",
  }),
});

export const requestPasswordResetSchema = Joi.object({
  email: emailField,
});

export const verifyResetTokenSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Password reset token is required.",
    "string.empty": "Password reset token is required.",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Password reset token is required.",
    "string.empty": "Password reset token is required.",
  }),
  newPassword: strongPasswordField,
});
