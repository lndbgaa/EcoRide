import { login, logout, registerUser } from "@/controllers/auth.controller.js";
import requireAuth from "@/middlewares/requireAuth.js";
import validate from "@/middlewares/validateData.js";
import loginSchema from "@/validators/login.validator.js";
import logoutSchema from "@/validators/logout.validator.js";
import registerSchema from "@/validators/register.validator.js";
import { Router } from "express";

const router = Router();

router.post("/user/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), login);

router.post("/logout", requireAuth, validate(logoutSchema), logout);

export default router;
