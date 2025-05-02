import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import optionalAuth from "@/middlewares/optionalAuth.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { createRideSchema, searchRidesSchema } from "@/validators/ride.validator.js";

import {
  cancelRide,
  createRide,
  endRide,
  getRideDetails,
  searchForRides,
  startRide,
} from "@/controllers/ride.controller.js";

const router = Router();

// Routes publiques (sans authentification)

router.post("/search", optionalAuth, validate(searchRidesSchema), searchForRides);
router.get("/:id", optionalAuth, validate(idParamSchema, "params"), getRideDetails);

// Routes privées (avec authentification)

router.post(
  "/",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(createRideSchema),
  createRide
);

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  cancelRide
);

router.patch(
  "/:id/start",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  startRide
);

router.patch(
  "/:id/end",
  requireAuth,
  requireRole([ACCOUNT_ROLES_LABEL.USER]),
  validate(idParamSchema, "params"),
  endRide
);

export default router;
