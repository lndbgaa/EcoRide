import { Router } from "express";

import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { addPreferenceSchema, preferenceIdParamSchema } from "@/validators/preference.validator.js";
import { updateInfoSchema, updateRoleSchema } from "@/validators/user.validator.js";
import {
  addVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from "@/validators/vehicle.validator.js";

import {
  addPreferenceToProfile,
  addVehicleToProfile,
  deletePreferenceFromProfile,
  deleteVehicleFromProfile,
  getUserInfo,
  getUserPreferences,
  getUserVehicles,
  updatePreferenceFromProfile,
  updateUserAvatar,
  updateUserInfo,
  updateUserRole,
  updateVehicleFromProfile,
} from "@/controllers/user.controller.js";

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
router.post("/me/vehicles", validate(addVehicleSchema), addVehicleToProfile);
router.patch(
  "/me/vehicles/:vehicleId",
  validate(vehicleIdParamSchema, "params"),
  validate(updateVehicleSchema),
  updateVehicleFromProfile
);
router.delete(
  "/me/vehicles/:vehicleId",
  validate(vehicleIdParamSchema, "params"),
  deleteVehicleFromProfile
);

// Routes pour les préférences
router.get("/me/preferences", getUserPreferences);
router.post("/me/preferences", validate(addPreferenceSchema), addPreferenceToProfile);
router.patch(
  "/me/preferences/:preferenceId",
  validate(preferenceIdParamSchema, "params"),
  updatePreferenceFromProfile
);
router.delete(
  "/me/preferences/:preferenceId",
  validate(preferenceIdParamSchema, "params"),
  deletePreferenceFromProfile
);

export default router;
