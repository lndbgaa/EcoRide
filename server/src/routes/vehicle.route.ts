import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import { addVehicle, deleteVehicle, getVehicle, updateVehicle } from "@/controllers/vehicle.controller.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { addVehicleSchema, updateVehicleSchema } from "@/validators/vehicle.validator.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.get("/:id", validate(idParamSchema, "params"), getVehicle);
router.post("/", validate(addVehicleSchema), addVehicle);
router.put("/:id", validate(idParamSchema, "params"), validate(updateVehicleSchema), updateVehicle);
router.delete("/:id", validate(idParamSchema, "params"), deleteVehicle);

export default router;
