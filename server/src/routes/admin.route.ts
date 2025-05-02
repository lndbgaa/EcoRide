import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { registerEmployeeSchema } from "@/validators/auth.validator.js";
import { idParamSchema } from "@/validators/common.validator.js";

import {
  suspendAccount,
  unsuspendAccount,
} from "@/controllers/admin.controller.js";
import { registerEmployee } from "@/controllers/auth.controller.js";
import {
  getPlatformDailyCredits,
  getPlatformDailyRides,
  getPlatformTotalCredits,
} from "@/controllers/statistics.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.ADMIN]));

// Création compte employé
router.post("/employees", validate(registerEmployeeSchema), registerEmployee);

// Gestion des comptes
router.patch(
  "/accounts/:id/suspend",
  validate(idParamSchema, "params"),
  suspendAccount
);

router.patch(
  "/accounts/:id/unsuspend",
  validate(idParamSchema, "params"),
  unsuspendAccount
);

// Statistiques
router.get("/stats/daily-rides", getPlatformDailyRides);
router.get("/stats/daily-credits", getPlatformDailyCredits);
router.get("/stats/total-credits", getPlatformTotalCredits);

export default router;
