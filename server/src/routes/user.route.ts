import { Router } from "express";

import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateData.js";

import { updateUserAvatar, updateUserInfo, updateUserRole } from "@/controllers/user.controller.js";
import { updateInfoSchema, updateRoleSchema } from "@/validators/user.validator.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["user"]));

//router.get("/me", getUser);
router.patch("/me/info", validate(updateInfoSchema), updateUserInfo);
router.patch("/me/role", validate(updateRoleSchema), updateUserRole);
router.patch("/me/avatar", multerUploads, updateUserAvatar);

router.post("/me/vehicles", createVehicle);
//router.patch("/me/vehicles/:vehicleId");
//router.delete("/me/vehicles/:vehicleId");

//router.post("/me/preferences");
//router.patch("/me/preferences/:preferenceId");
//router.delete("/me/preferences/:preferenceId");

export default router;
