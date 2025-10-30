import { Router } from "express";

import { loginLimiter, passwordResetLimiter, registerLimiter, validateAll } from "@/middlewares";

import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetTokenSchema,
} from "@/validation";

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

const router = Router();

router.post("/register", registerLimiter, validateAll(registerSchema), register);
router.post("/login", loginLimiter, validateAll(loginSchema), login);
router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/verify-email/resend", validateAll(resendVerificationSchema), resendEmailVerificationLink);
router.post("/verify-email", validateAll(verifyEmailSchema), verifyEmail);

router.post("/reset-password/request", passwordResetLimiter, validateAll(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password/verify", validateAll(verifyResetTokenSchema), verifyPasswordResetToken);
router.post("/reset-password", validateAll(resetPasswordSchema), resetPassword);

export default router;
