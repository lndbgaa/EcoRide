import { Router } from "express";

import { authLimiter, registerLimiter } from "@/middlewares/rateLimiter.js";
import validate from "@/middlewares/validateAll.js";

import { loginSchema, registerUserSchema } from "@/validators/auth.validator.js";

import {
  handleTokenRefresh,
  login,
  logout,
  registerUser,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", registerLimiter, validate(registerUserSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh-token", handleTokenRefresh);

export default router;
