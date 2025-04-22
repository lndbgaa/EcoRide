import { registerEmployee } from "@/controllers/admin.controller.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";
import registerSchema from "@/validators/register.validator.js";
import { Router } from "express";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.post("/employees", validate(registerSchema), registerEmployee);

export default router;
