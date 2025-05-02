import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idParamSchema } from "@/validators/common.validator.js";
import {
  createIncidentSchema,
  resolveIncidentSchema,
} from "@/validators/incident.validator.js";

const router = Router();

import {
  assignIncident,
  createIncident,
  getIncidentDetails,
  getPendingIncidents,
  resolveIncident,
} from "@/controllers/incident.controller.js";

router.post(
  "/",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(createIncidentSchema),
  createIncident
);

router.get(
  "/pending",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  getPendingIncidents
);

router.get(
  "/:id",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  validate(idParamSchema, "params"),
  getIncidentDetails
);

router.patch(
  "/:id/assign",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  validate(idParamSchema, "params"),
  assignIncident
);

router.patch(
  "/:id/resolve",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  validate(idParamSchema, "params"),
  validate(resolveIncidentSchema),
  resolveIncident
);

export default router;
