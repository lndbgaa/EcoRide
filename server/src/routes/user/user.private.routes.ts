import { Router } from "express";

import {
  createMyVehicle,
  deleteMyVehicle,
  getMyInfo,
  getMyPreference,
  getMyPreferences,
  getMyVehicle,
  getMyVehicles,
  requestMyDeletion,
  updateMyInfo,
  updateMyPassword,
  updateMyPicture,
  updateMyPreference,
  updateMyVehicle,
} from "@/controllers";
import { imageUpload, requireAuth, validateAll } from "@/middlewares";
import {
  createVehicleBodySchema,
  idParamSchema,
  updateUserInfoBodySchema,
  updateUserPasswordBodySchema,
  updateVehicleBodySchema,
} from "@/validations";
import { categoryKeyParamSchema, updatePreferenceBodySchema } from "@/validations/preference.validation";

const router = Router();

router.use(requireAuth);

// ============================================
// Profile
// ============================================
router.get("/", getMyInfo);
router.patch("/", validateAll(updateUserInfoBodySchema), updateMyInfo);
router.patch("/password", validateAll(updateUserPasswordBodySchema), updateMyPassword);
router.patch("/profile-picture", imageUpload, updateMyPicture);

// ============================================
// Vehicles
// ============================================
router.get("/vehicles", getMyVehicles);
router.get("/vehicles/:id", validateAll(idParamSchema, "params"), getMyVehicle);
router.post("/vehicles", validateAll(createVehicleBodySchema), createMyVehicle);
router.patch("/vehicles/:id", validateAll(idParamSchema, "params"), validateAll(updateVehicleBodySchema), updateMyVehicle);
router.delete("/vehicles/:id", validateAll(idParamSchema, "params"), deleteMyVehicle);

// ============================================
// Preferences
// ============================================
router.get("/preferences", getMyPreferences);
router.get("/preferences/:categoryKey", validateAll(categoryKeyParamSchema, "params"), getMyPreference);
router.patch("/preferences/:categoryKey", validateAll(categoryKeyParamSchema, "params"), validateAll(updatePreferenceBodySchema), updateMyPreference);

// ============================================
// Account Deletion
// ============================================
router.post("/deletion-request", requestMyDeletion);

export default router;
