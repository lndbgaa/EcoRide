import { Router } from "express";

import { cancelAccountDeletion } from "@/controllers";
import { validateAll } from "@/middlewares";
import { cancelAccountDeletionBodySchema } from "@/validations";

const router = Router();

router.post("/deletion-request/cancel", validateAll(cancelAccountDeletionBodySchema), cancelAccountDeletion);

export default router;
