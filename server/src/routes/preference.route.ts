import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth";
import requireRole from "@/middlewares/requireRole";
import validate from "@/middlewares/validateAll";

import { addPreference, deletePreference, updatePreference } from "@/controllers/preference.controller";
import { idParamSchema } from "@/validators/common.validator";
import { addPreferenceSchema } from "@/validators/preference.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.post("/", validate(addPreferenceSchema), addPreference);
router.patch("/:id", validate(idParamSchema, "params"), updatePreference);
router.delete("/:id", validate(idParamSchema, "params"), deletePreference);

export default router;
