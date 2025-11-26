import { Router } from "express";

import { getUserInfo, getUserPreferences } from "@/controllers";
import { validateAll } from "@/middlewares";
import { idParamSchema } from "@/validations";

const router = Router();

router.get("/preferences/:id", validateAll(idParamSchema, "params"), getUserPreferences);

router.get("/:id", validateAll(idParamSchema, "params"), getUserInfo);

export default router;
