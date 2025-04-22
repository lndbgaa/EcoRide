import { registerEmployee } from "@/controllers/admin.controller.js";
import validate from "@/middlewares/validate.js";
import registerSchema from "@/validators/register.validator.js";
import { Router } from "express";

const router = Router();

router.post("/create-employee", validate(registerSchema), registerEmployee);

export default router;
