import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { createRideSchema, searchRidesSchema } from "@/validators/ride.validator.js";

import {
  cancelRide,
  createRide,
  endRide,
  getRideDetails,
  searchForRides,
  startRide,
} from "@/controllers/rides.controllers.js";

const router = Router();

// Routes publiques

router.post("/search", validate(searchRidesSchema), searchForRides);
router.get("/:id", validate(idParamSchema, "params"), getRideDetails);

// Routes privées

router.use(requireAuth);
router.use(requireRole(["user"]));

router.post("/", validate(createRideSchema), createRide);
router.patch("/:id/cancel", validate(idParamSchema, "params"), cancelRide);
router.patch("/:id/start", validate(idParamSchema, "params"), startRide);
router.patch("/:id/end", validate(idParamSchema, "params"), endRide);

export default router;
