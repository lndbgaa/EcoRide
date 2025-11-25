import { Router } from "express";

import authRouter from "./auth/";
import usersRouter from "./user/index.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;
