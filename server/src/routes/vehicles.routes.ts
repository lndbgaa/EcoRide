import { Router } from "express";

import { createVehicle, deleteVehicle, getVehicle, getVehicles, updateVehicle } from "@/controllers";
import { requireAuth, validateAll } from "@/middlewares";
import { createVehicleSchema, idParamSchema, updateVehicleSchema } from "@/validations";

const router = Router();

router.use(requireAuth);

router.get("/", getVehicles);
router.get("/:id", validateAll(idParamSchema, "params"), getVehicle);
router.post("/", validateAll(createVehicleSchema, "body"), createVehicle);
router.patch("/:id", validateAll(idParamSchema, "params"), validateAll(updateVehicleSchema, "body"), updateVehicle);
router.delete("/:id", validateAll(idParamSchema, "params"), deleteVehicle);

export default router;
