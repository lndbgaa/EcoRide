import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";

const router = Router();

import { createIncident } from "@/controllers/incidents.controllers.js";

router.post("/", requireAuth, requireRole(["user"]), createIncident);

export default router;
