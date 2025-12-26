import { Router } from "express";

import { USER_ROLES_KEY } from "@/constants";
import { getMyIncidents } from "@/controllers";
import { requireRole, validateAll } from "@/middlewares";
import { getMyIncidentsQuerySchema } from "@/validations";

const { MODERATOR, ADMIN } = USER_ROLES_KEY;

const router = Router();

router.use(requireRole([ADMIN, MODERATOR]));

router.get("/", validateAll(getMyIncidentsQuerySchema, "query"), getMyIncidents);

export default router;
