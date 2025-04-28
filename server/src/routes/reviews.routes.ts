import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";
import { ACCOUNT_ROLES_LABEL } from "@/models/mysql/Account.model.js";

import createReviewSchema from "@/validators/review.validator.js";

import { createReview } from "@/controllers/review.controllers.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.post("/", validate(createReviewSchema), createReview);

export default router;
