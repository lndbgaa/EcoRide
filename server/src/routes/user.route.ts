import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { updateInfoSchema, updateRoleSchema } from "@/validators/user.validator.js";
import { addVehicleSchema, updateVehicleSchema } from "@/validators/vehicle.validator.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { addPreferenceSchema } from "@/validators/preference.validator.js";

import {
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
  updateUserRole,
} from "@/controllers/user.controller.js";

import {
  addPreference,
  deletePreference,
  getUserPreferences,
  updatePreference,
} from "@/controllers/preference.controller.js";

import {
  addVehicle,
  deleteVehicle,
  getMyVehicles,
  updateVehicle,
} from "@/controllers/vehicle.controller.js";

import { getMyRides } from "@/controllers/ride.controller.js";

import { getMyBookings } from "@/controllers/booking.controller.js";

import {
  getMyReceivedReviews,
  getMyWrittenReviews,
} from "@/controllers/review.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

// Routes pour les informations de l'utilisateur connecté

router.get("/me", getUserInfo);
router.patch("/me", validate(updateInfoSchema), updateUserInfo);
router.patch("/me/role", validate(updateRoleSchema), updateUserRole);
router.patch("/me/avatar", multerUploads, updateUserAvatar);

// Routes pour les véhicules de l'utilisateur connecté

router.get("/me/vehicles", getMyVehicles);
router.post("/me/vehicles", validate(addVehicleSchema), addVehicle);
router.patch(
  "/me/vehicles/:id",
  validate(idParamSchema, "params"),
  validate(updateVehicleSchema),
  updateVehicle
);
router.delete("/me/vehicles/:id", validate(idParamSchema, "params"), deleteVehicle);

// Routes pour les préférences de l'utilisateur connecté

router.get("/me/preferences", getUserPreferences);
router.post("/me/preferences", validate(addPreferenceSchema), addPreference);
router.patch("/me/preferences/:id", validate(idParamSchema, "params"), updatePreference);
router.delete("/me/preferences/:id", validate(idParamSchema, "params"), deletePreference);

// Routes pour les historiques des trajets et des réservations de l'utilisateur connecté

router.get("/me/rides", getMyRides);
router.get("/me/bookings", getMyBookings);

// Routes pour les historiques des avis reçus et écrits de l'utilisateur connecté

router.get("/me/reviews/received", getMyReceivedReviews);
router.get("/me/reviews/written", getMyWrittenReviews);

export default router;
