import { Router } from "express";

import { USER_ROLES_KEY } from "@/constants";
import { approveReview, createReview, getPendingReviews, rejectReview } from "@/controllers";
import { requireAuth, requireRole, validateAll } from "@/middlewares";
import { createReviewBodySchema, idParamSchema } from "@/validations";

const { ADMIN, MODERATOR } = USER_ROLES_KEY;

const router = Router();

router.use(requireAuth);

router.get("/pending", requireRole([ADMIN, MODERATOR]), getPendingReviews);

router.post("/", validateAll(createReviewBodySchema), createReview);

router.patch(
  "/:id/approve",
  requireRole([ADMIN, MODERATOR]),
  validateAll(idParamSchema, "params"),
  approveReview
);

router.patch(
  "/:id/reject",
  requireRole([ADMIN, MODERATOR]),
  validateAll(idParamSchema, "params"),
  rejectReview
);

export default router;
