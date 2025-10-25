import { Router } from "express";

import { registerUser, resendUserVerificationEmail, verifyUserEmail } from "@/controllers";

const router = Router();

router.post("/register", registerUser);
router.post("/verify-email/verify", verifyUserEmail);
router.post("/verify-email/resend", resendUserVerificationEmail);

export default router;
