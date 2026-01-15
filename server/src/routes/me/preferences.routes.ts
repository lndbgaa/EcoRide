import { Router } from "express";

import { getMyPreferences, updateMyPreference } from "@/controllers";
import { validateAll } from "@/middlewares";
import { preferenceCategoryKeyParamSchema, updatePreferenceBodySchema } from "@/validations";

const router = Router();

router.get("/", getMyPreferences);
router.patch(
  "/:categoryKey",
  validateAll(preferenceCategoryKeyParamSchema, "params"),
  validateAll(updatePreferenceBodySchema),
  updateMyPreference
);

export default router;
