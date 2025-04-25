import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";
import { ACCOUNT_ROLES_LABEL } from "@/models/mysql/Account.model.js";

import {
  createRideSchema,
  rideIdParamSchema,
  searchRidesSchema,
} from "@/validators/ride.validator.js";

import {
  bookRide,
  cancelRide,
  createRide,
  endRide,
  getRideDetails,
  searchForRides,
  startRide,
} from "@/controllers/rides.controllers.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.post("/search", validate(searchRidesSchema), searchForRides);
router.post("/", validate(createRideSchema), createRide);
router.get("/:rideId", validate(rideIdParamSchema, "params"), getRideDetails);

router.patch("/:rideId/cancel", validate(rideIdParamSchema, "params"), cancelRide);
router.patch("/:rideId/start", validate(rideIdParamSchema, "params"), startRide);
router.patch("/:rideId/end", validate(rideIdParamSchema, "params"), endRide);

router.post("/:rideId/book", validate(rideIdParamSchema, "params"), bookRide);

export default router;
