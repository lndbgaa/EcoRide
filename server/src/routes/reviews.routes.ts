import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import createReviewSchema from "@/validators/review.validator.js";

import {
  approveReview,
  createReview,
  getReviews,
  rejectReview,
} from "@/controllers/reviews.controllers.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["user"]),
  validate(createReviewSchema),
  createReview
);

router.get("/", requireAuth, requireRole(["employee"]), getReviews);

router.patch(
  "/:id/approve",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  approveReview
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole(["employee"]),
  validate(idParamSchema, "params"),
  rejectReview
);

export default router;
