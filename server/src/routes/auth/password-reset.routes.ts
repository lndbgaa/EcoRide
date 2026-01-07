import { Router } from "express";

import { requestUserPasswordReset, resetUserPassword, verifyUserPasswordResetToken } from "@/controllers";
import { passwordResetLimiter, validateAll } from "@/middlewares";
import { requestUserPasswordResetBodySchema, resetUserPasswordBodySchema, verifyUserResetTokenBodySchema } from "@/validations";

const router = Router();

router.post("/request", passwordResetLimiter, validateAll(requestUserPasswordResetBodySchema), requestUserPasswordReset);
router.post("/verify", validateAll(verifyUserResetTokenBodySchema), verifyUserPasswordResetToken);
router.post("/reset", validateAll(resetUserPasswordBodySchema), resetUserPassword);

export default router;
