import { Router } from "express";

import validate from "@/middlewares/validateData.js";
import { loginSchema, registerSchema } from "@/validators/auth.validator.js";

import { login, logout, refreshToken, registerUser } from "@/controllers/auth.controller.js";

const router = Router();

router.post("/user/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.get("/refresh-token", refreshToken);

export default router;
