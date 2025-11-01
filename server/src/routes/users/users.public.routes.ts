import { Router } from "express";

import { cancelDeletionRequest } from "@/controllers";

const router = Router();

router.post("/deletion-request/cancel", cancelDeletionRequest);

export default router;
