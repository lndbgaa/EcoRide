import { Router } from "express";

import { cancelTrip, createTrip, endTrip, getPublicTripDetails, searchTrips, startTrip } from "@/controllers";
import { optionalAuth, requireAuth, validateAll } from "@/middlewares";
import { createTripBodySchema, idParamSchema, searchTripsBodySchema } from "@/validations";

const router = Router();

router.post("/search", optionalAuth, validateAll(searchTripsBodySchema), searchTrips);
router.get("/:id/public", validateAll(idParamSchema, "params"), getPublicTripDetails);

router.post("/", requireAuth, validateAll(createTripBodySchema), createTrip);
router.patch("/:id/cancel", requireAuth, validateAll(idParamSchema, "params"), cancelTrip);
router.patch("/:id/start", requireAuth, validateAll(idParamSchema, "params"), startTrip);
router.patch("/:id/end", requireAuth, validateAll(idParamSchema, "params"), endTrip);

export default router;
