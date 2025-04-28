import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import createReviewSchema from "@/validators/review.validator.js";

import { createReview } from "@/controllers/review.controllers.js";

const router = Router();

router.use(requireAuth, requireRole(["user"]));

router.post("/", validate(createReviewSchema), createReview);

export default router;
