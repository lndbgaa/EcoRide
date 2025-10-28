import { Router } from "express";

import {
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
  resendUserVerificationEmail,
  verifyUserEmail,
} from "@/controllers";

const router = Router();

router.post("/register", registerUser);
router.post("/verify-email/verify", verifyUserEmail);
router.post("/verify-email/resend", resendUserVerificationEmail);

router.post("/login", loginUser);
router.post("/refresh-tokens", refreshUserTokens);
router.post("/logout", logoutUser);

export default router;
