import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { IncidentStatusSchema } from "@/validators/incident.validator.js";

import { getEmployeeIncidents } from "@/controllers/employees.controllers.js";

const router = Router();

router.get(
  "/:id/incidents",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  validate(IncidentStatusSchema, "query"),
  getEmployeeIncidents
);

export default router;
