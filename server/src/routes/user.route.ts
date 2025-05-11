import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { updateInfoSchema, updateRoleSchema } from "@/validators/user.validator.js";

import {
  getMyInfo,
  getMyNextEvent,
  getMyPreferences,
  getMyUpcomingEvents,
  getMyVehicles,
  updateMyAvatar,
  updateMyInfo,
  updateMyRole,
} from "@/controllers/user.controller.js";

import { getMyBookings } from "@/controllers/booking.controller.js";
import { getMyReceivedReviews, getMyWrittenReviews } from "@/controllers/review.controller.js";
import { getMyRides } from "@/controllers/ride.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

// Routes pour les informations de l'utilisateur connecté
router.get("/me", getMyInfo);
router.patch("/me", validate(updateInfoSchema), updateMyInfo);
router.patch("/me/role", validate(updateRoleSchema), updateMyRole);
router.patch("/me/avatar", multerUploads, updateMyAvatar);
router.get("/me/vehicles", getMyVehicles);
router.get("/me/preferences", getMyPreferences);

// Routes pour les événements de l'utilisateur connecté
router.get("/me/events/next", getMyNextEvent);
router.get("/me/events/upcoming", getMyUpcomingEvents);

// Routes pour les historiques de l'utilisateur connecté
router.get("/me/rides", getMyRides);
router.get("/me/bookings", getMyBookings);

// Routes pour les avis de l'utilisateur connecté
router.get("/me/reviews/received", getMyReceivedReviews);
router.get("/me/reviews/written", getMyWrittenReviews);

export default router;
