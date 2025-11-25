import { Router } from "express";

import authRoutes from "./auth.routes.js";
import emailVerificationRoutes from "./email-verification.routes.js";
import passwordResetRoutes from "./password-reset.routes.js";

const router = Router();

router.use("/", authRoutes);
router.use("/email-verification", emailVerificationRoutes);
router.use("/password-reset", passwordResetRoutes);

export default router;
