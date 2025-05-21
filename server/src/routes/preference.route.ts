import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { addPreference, deletePreference, updatePreference } from "@/controllers/preference.controller.js";
import { idParamSchema } from "@/validators/common.validator.js";
import { addPreferenceSchema } from "@/validators/preference.validator.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.post("/", validate(addPreferenceSchema), addPreference);
router.patch("/:id", validate(idParamSchema, "params"), updatePreference);
router.delete("/:id", validate(idParamSchema, "params"), deletePreference);

export default router;
