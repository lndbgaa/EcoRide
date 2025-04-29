import { Router } from "express";

import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { addPreferenceSchema } from "@/validators/preference.validator.js";
import { updateInfoSchema, updateRoleSchema } from "@/validators/user.validator.js";
import { addVehicleSchema, updateVehicleSchema } from "@/validators/vehicle.validator.js";

import {
  addPreference,
  addVehicle,
  deletePreference,
  deleteVehicle,
  getUserBookings,
  getUserInfo,
  getUserPreferences,
  getUserReceivedReviews,
  getUserRides,
  getUserVehicles,
  getUserWrittenReviews,
  updatePreference,
  updateUserAvatar,
  updateUserInfo,
  updateUserRole,
  updateVehicle,
} from "@/controllers/users.controllers.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["user"]));

// Routes pour les informations de l'utilisateur

router.get("/me", getUserInfo);
router.patch("/me/infos", validate(updateInfoSchema), updateUserInfo);
router.patch("/me/roles", validate(updateRoleSchema), updateUserRole);
router.patch("/me/avatar", multerUploads, updateUserAvatar);

// Routes pour les véhicules

router.get("/me/vehicles", getUserVehicles);
router.post("/me/vehicles", validate(addVehicleSchema), addVehicle);
router.patch(
  "/me/vehicles/:id",
  validate(idParamSchema, "params"),
  validate(updateVehicleSchema),
  updateVehicle
);
router.delete("/me/vehicles/:id", validate(idParamSchema, "params"), deleteVehicle);

// Routes pour les préférences

router.get("/me/preferences", getUserPreferences);
router.post("/me/preferences", validate(addPreferenceSchema), addPreference);
router.patch("/me/preferences/:id", validate(idParamSchema, "params"), updatePreference);
router.delete("/me/preferences/:id", validate(idParamSchema, "params"), deletePreference);

// Routes pour les historiques des trajets et des réservations

router.get("/me/rides", getUserRides);
router.get("/me/bookings", getUserBookings);

// Routes pour les historiques des avis reçus et écrits

router.get("/me/reviews/received", getUserReceivedReviews);
router.get("/me/reviews/written", getUserWrittenReviews);

export default router;
