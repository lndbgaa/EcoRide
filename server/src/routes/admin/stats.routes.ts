import { Router } from "express";

import { getPlatformDailyCredits, getPlatformDailyTrips, getPlatformTotalCredits } from "@/controllers";

const router = Router();

router.get("/daily-trips", getPlatformDailyTrips);
router.get("/daily-credits", getPlatformDailyCredits);
router.get("/total-credits", getPlatformTotalCredits);

export default router;
