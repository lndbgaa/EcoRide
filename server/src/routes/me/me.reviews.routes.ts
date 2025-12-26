import { Router } from "express";

import { getMyReceivedReviews, getMyWrittenReviews } from "@/controllers";

const router = Router();

router.get("/received", getMyReceivedReviews);
router.get("/written", getMyWrittenReviews);

export default router;
