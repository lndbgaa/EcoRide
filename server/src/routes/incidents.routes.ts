import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import {
  createIncidentSchema,
  getIncidentsByStatusSchema,
  resolveIncidentSchema,
} from "@/validators/incident.validator.js";

const router = Router();

import {
  assignIncident,
  createIncident,
  getIncidentDetails,
  getIncidentsByStatus,
  resolveIncident,
} from "@/controllers/incidents.controllers.js";

router.post(
  "/",
  requireAuth,
  requireRole(["user"]),
  validate(createIncidentSchema),
  createIncident
);

router.get(
  "/",
  requireAuth,
  requireRole(["employee"]),
  validate(getIncidentsByStatusSchema, "query"),
  getIncidentsByStatus
);

router.get(
  "/:id",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  getIncidentDetails
);

router.patch(
  "/:id/assign",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  assignIncident
);

router.patch(
  "/:id/resolve",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  validate(resolveIncidentSchema),
  resolveIncident
);

export default router;
