import { Router } from "express";

import validate from "@/middlewares/validateData.js";
import {
  loginSchema,
  registerUserSchema,
} from "@/validators/auth.validator.js";

import {
  handleTokenRefresh,
  login,
  logout,
  registerUser,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh-token", handleTokenRefresh);

export default router;
