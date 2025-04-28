import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import {
  createRideSchema,
  rideIdParamSchema,
  searchRidesSchema,
} from "@/validators/ride.validator.js";

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
router.get("/:rideId", validate(rideIdParamSchema, "params"), getRideDetails);

// Routes privées

router.use(requireAuth);
router.use(requireRole(["user"]));

router.post("/", validate(createRideSchema), createRide);

router.patch("/:rideId/cancel", validate(rideIdParamSchema, "params"), cancelRide);
router.patch("/:rideId/start", validate(rideIdParamSchema, "params"), startRide);
router.patch("/:rideId/end", validate(rideIdParamSchema, "params"), endRide);

export default router;
