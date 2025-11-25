import { Router } from "express";

import { cancelMyDeletionRequest } from "@/controllers";

const router = Router();

router.post("/deletion-request/cancel", cancelMyDeletionRequest);

export default router;
