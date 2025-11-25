import { Router } from "express";

import usersPrivateRouter from "./user.private.routes.js";
import usersPublicRouter from "./user.public.routes.js";

const router = Router();

router.use("/", usersPublicRouter);
router.use("/me", usersPrivateRouter);

export default router;
