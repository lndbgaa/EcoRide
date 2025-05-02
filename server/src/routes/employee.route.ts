import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";

import {
  getEmployeeAssignedIncidents,
  getEmployeeResolvedIncidents,
} from "@/controllers/employee.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]));

router.get("/me/incidents/assigned", getEmployeeAssignedIncidents);
router.get("/me/incidents/resolved", getEmployeeResolvedIncidents);

export default router;
