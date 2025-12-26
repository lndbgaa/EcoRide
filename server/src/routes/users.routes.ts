import { Router } from "express";

import { getUserInfo, getUserPreferences, getUserReceivedReviews } from "@/controllers";
import { validateAll } from "@/middlewares";
import { idParamSchema } from "@/validations";

const router = Router();

router.get("/:id/preferences", validateAll(idParamSchema, "params"), getUserPreferences);
router.get("/:id/reviews/received", validateAll(idParamSchema, "params"), getUserReceivedReviews);
router.get("/:id", validateAll(idParamSchema, "params"), getUserInfo);

export default router;
