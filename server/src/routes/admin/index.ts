import { Router } from "express";

import { USER_ROLES_KEY } from "@/constants";
import { requireAuth, requireRole } from "@/middlewares";

import statsAdminRouter from "./stats.routes.js";
import usersAdminRouter from "./users.routes.js";

const { ADMIN } = USER_ROLES_KEY;

const router = Router();

router.use(requireAuth);
router.use(requireRole([ADMIN]));

router.use("/users", usersAdminRouter);
router.use("/stats", statsAdminRouter);

export default router;
