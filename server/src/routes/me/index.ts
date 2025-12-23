import { Router } from "express";

import incidentsRouter from "./me.incidents.routes.js";
import preferencesRouter from "./me.preferences.routes.js";
import profileRouter from "./me.profile.routes.js";
import vehiclesRouter from "./me.vehicles.routes.js";

const router = Router();

router.use("/", profileRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/preferences", preferencesRouter);
router.use("/incidents", incidentsRouter);

export default router;
