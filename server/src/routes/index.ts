import { Router } from "express";

import authRouter from "./auth.routes.js";
import usersRouter from "./users";
import vehiclesRouter from "./vehicles.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
