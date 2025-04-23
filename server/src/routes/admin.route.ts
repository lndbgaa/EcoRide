import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";
import registerSchema from "@/validators/auth.validator.js";
import { idParamSchema } from "@/validators/common.validator.js";

import {
  registerEmployee,
  suspendAccount,
  unsuspendAccount,
} from "@/controllers/admin.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.post("/employees", validate(registerSchema), registerEmployee);
router.post("/accounts/:id/suspend", validate(idParamSchema), suspendAccount);
router.post("/accounts/:id/unsuspend", validate(idParamSchema), unsuspendAccount);

export default router;
