import { Router } from "express";

import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import { addVehicle, deleteVehicle, getVehicle, updateVehicle } from "@/controllers/vehicle.controller";
import requireAuth from "@/middlewares/requireAuth";
import requireRole from "@/middlewares/requireRole";
import validate from "@/middlewares/validateAll";

import { idParamSchema } from "@/validators/common.validator";
import { addVehicleSchema, updateVehicleSchema } from "@/validators/vehicle.validator";

const router = Router();

router.use(requireAuth);
router.use(requireRole([ACCOUNT_ROLES_LABEL.USER]));

router.get("/:id", validate(idParamSchema, "params"), getVehicle);
router.post("/", validate(addVehicleSchema), addVehicle);
router.put("/:id", validate(idParamSchema, "params"), validate(updateVehicleSchema), updateVehicle);
router.delete("/:id", validate(idParamSchema, "params"), deleteVehicle);

export default router;
