import { Router } from "express";

import authRouter from "./auth.routes.js";
import emailVerificationRouter from "./email-verification.routes.js";
import passwordResetRouter from "./password-reset.routes.js";

const router = Router();

router.use("/email-verification", emailVerificationRouter);
router.use("/password-reset", passwordResetRouter);
router.use("/", authRouter);

export default router;
