import { Router } from "express";

import usersPrivateRouter from "./users.private.routes.js";

const router = Router();

router.use("/me", usersPrivateRouter);

export default router;
