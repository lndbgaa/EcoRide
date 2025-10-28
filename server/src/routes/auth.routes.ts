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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/verify-email/resend", resendEmailVerificationLink);
router.post("/verify-email", verifyEmail);

router.post("/reset-password/request", requestPasswordReset);
router.post("/reset-password/verify", verifyPasswordResetToken);
router.post("/reset-password", resetPassword);

export default router;
