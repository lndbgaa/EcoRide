import { Router } from "express";

import {
  login,
  logout,
  refreshToken,
  register,
  requestPasswordReset,
  resendEmailVerificationLink,
  resetPassword,
  verifyEmail,
  verifyPasswordResetToken,
} from "@/controllers";
import { loginLimiter, passwordResetLimiter, validateAll } from "@/middlewares";
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetTokenSchema,
} from "@/validations";

const router = Router();

router.post("/register", validateAll(registerSchema, "body"), register);
router.post("/login", loginLimiter, validateAll(loginSchema, "body"), login);
router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post(
  "/verify-email/resend",
  validateAll(resendVerificationSchema, "body"),
  resendEmailVerificationLink
);
router.post("/verify-email", validateAll(verifyEmailSchema, "body"), verifyEmail);

router.post(
  "/reset-password/request",
  passwordResetLimiter,
  validateAll(requestPasswordResetSchema, "body"),
  requestPasswordReset
);
router.post("/reset-password/verify", validateAll(verifyResetTokenSchema, "body"), verifyPasswordResetToken);
router.post("/reset-password", validateAll(resetPasswordSchema, "body"), resetPassword);

export default router;
