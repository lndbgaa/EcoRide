import { Router } from "express";

import validate from "@/middlewares/validateData.js";
import { loginSchema, registerSchema } from "@/validators/auth.validator.js";

import {
  handleTokenRefresh,
  login,
  logout,
  registerUser,
} from "@/controllers/auth.controllers.js";

const router = Router();

router.post("/user/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh-token", handleTokenRefresh);

export default router;
