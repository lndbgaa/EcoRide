import { Router } from "express";

import { resendEmailVerification, verifyUserEmail } from "@/controllers";
import { validateAll } from "@/middlewares";
import { resendEmailVerificationBodySchema, verifyUserEmailBodySchema } from "@/validations";

const router = Router();

router.post("/resend", validateAll(resendEmailVerificationBodySchema), resendEmailVerification);
router.post("/verify", validateAll(verifyUserEmailBodySchema), verifyUserEmail);

export default router;
