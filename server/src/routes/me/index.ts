import { Router } from "express";

import { requireAuth } from "@/middlewares";

import incidentsRouter from "./me.incidents.routes.js";
import preferencesRouter from "./me.preferences.routes.js";
import profileRouter from "./me.profile.routes.js";
import reviewsRouter from "./me.reviews.routes.js";
import vehiclesRouter from "./me.vehicles.routes.js";

const router = Router();

router.use(requireAuth);

router.use("/", profileRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/preferences", preferencesRouter);
router.use("/incidents", incidentsRouter);
router.use("/reviews", reviewsRouter);

export default router;
