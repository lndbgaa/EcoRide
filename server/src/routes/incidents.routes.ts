import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";

const router = Router();

import {
  assignIncident,
  createIncident,
  getIncidentDetails,
  getIncidentsByStatus,
  resolveIncident,
} from "@/controllers/incidents.controllers.js";

router.post("/", requireAuth, requireRole(["user"]), createIncident);

router.get("/", requireAuth, requireRole(["employee"]), getIncidentsByStatus);

router.get("/:id", requireAuth, requireRole(["employee"]), getIncidentDetails);

router.patch(
  "/:id/assign",
  requireAuth,
  requireRole(["employee"]),
  assignIncident
);

router.patch(
  "/:id/resolve",
  requireAuth,
  requireRole(["employee"]),
  resolveIncident
);

export default router;
