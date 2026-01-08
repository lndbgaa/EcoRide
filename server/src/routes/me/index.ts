import { Router } from "express";

import { requireAuth } from "@/middlewares";

import {
  getMyBookingsHistory,
  getMyNextEvent,
  getMyReceivedReviews,
  getMyTripsHistory,
  getMyUpcomingEvents,
  getMyWrittenReviews,
} from "@/controllers";

import incidentsRouter from "./me.incidents.routes.js";
import preferencesRouter from "./me.preferences.routes.js";
import profileRouter from "./me.profile.routes.js";
import vehiclesRouter from "./me.vehicles.routes.js";

const router = Router();

router.use(requireAuth);

router.use("/", profileRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/preferences", preferencesRouter);

router.get("/events/next", getMyNextEvent);
router.get("/events/upcoming", getMyUpcomingEvents);

router.get("/trips/history", getMyTripsHistory);
router.get("/bookings/history", getMyBookingsHistory);

router.get("/reviews/received", getMyReceivedReviews);
router.get("/reviews/written", getMyWrittenReviews);

router.use("/incidents", incidentsRouter);

export default router;
