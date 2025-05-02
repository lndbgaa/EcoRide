import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { createReviewSchema } from "@/validators/review.validator.js";

import {
  approveReview,
  createReview,
  getPendingReviews,
  getUserReceivedReviews,
  rejectReview,
} from "@/controllers/review.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(createReviewSchema),
  createReview
);

router.get(
  "/user/:id/received",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  getUserReceivedReviews
);

router.get(
  "/pending",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  getPendingReviews
);

router.patch(
  "/:id/approve",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  validate(idParamSchema, "params"),
  approveReview
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.EMPLOYEE]),
  validate(idParamSchema, "params"),
  rejectReview
);

export default router;
