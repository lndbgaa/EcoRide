import { Router } from "express";

import usersPrivateRouter from "./users.private.routes.js";
import usersPublicRouter from "./users.public.routes.js";

const router = Router();

router.use("/", usersPublicRouter);
router.use("/me", usersPrivateRouter);

export default router;
