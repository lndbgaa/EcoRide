import { Router } from "express";

import { loginUser, logoutUser, refreshUserToken, registerUser } from "@/controllers";
import { loginLimiter, registerLimiter, validateAll } from "@/middlewares";
import { loginUserBodySchema, registerUserBodySchema } from "@/validations";

const router = Router();

router.post("/register", registerLimiter, validateAll(registerUserBodySchema), registerUser);
router.post("/login", loginLimiter, validateAll(loginUserBodySchema), loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserToken);

export default router;
