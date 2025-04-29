import { Router } from "express";

import { getEmployeeIncidents } from "@/controllers/employees.controllers.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";

const router = Router();

router.get(
  "/:id/incidents",
  requireAuth,
  requireRole(["employee"]),
  getEmployeeIncidents
);

export default router;
