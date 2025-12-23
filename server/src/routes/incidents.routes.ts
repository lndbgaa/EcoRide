import { Router } from "express";

import { USER_ROLES_KEY } from "@/constants";
import {
  assignIncident,
  getIncidentDetails,
  getIncidents,
  getPendingIncidents,
  resolveIncident,
} from "@/controllers";
import { requireAuth, requireRole, validateAll } from "@/middlewares";
import {
  getIncidentsQuerySchema,
  idParamSchema,
  resolveIncidentBodySchema,
} from "@/validations";

const { MODERATOR, ADMIN } = USER_ROLES_KEY;

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole([ADMIN]),
  validateAll(getIncidentsQuerySchema, "query"),
  getIncidents
);

router.get(
  "/pending",
  requireRole([MODERATOR, ADMIN]),
  getPendingIncidents
);

router.get(
  "/:id",
  requireRole([MODERATOR, ADMIN]),
  validateAll(idParamSchema, "params"),
  getIncidentDetails
);

router.patch(
  "/:id/assign",
  requireRole([MODERATOR, ADMIN]),
  validateAll(idParamSchema, "params"),
  assignIncident
);

router.patch(
  "/:id/resolve",
  requireRole([MODERATOR, ADMIN]),
  validateAll(idParamSchema, "params"),
  validateAll(resolveIncidentBodySchema),
  resolveIncident
);

export default router;
