import { Router } from "express";

import {
  createMyVehicle,
  deleteMyVehicle,
  getMyVehicle,
  getMyVehicles,
  updateMyVehicle,
} from "@/controllers";
import { validateAll } from "@/middlewares";
import { createVehicleBodySchema, idParamSchema, updateVehicleBodySchema } from "@/validations";

const router = Router();

router.get("/", getMyVehicles);
router.get("/:id", validateAll(idParamSchema, "params"), getMyVehicle);
router.post("/", validateAll(createVehicleBodySchema), createMyVehicle);
router.patch(
  "/:id",
  validateAll(idParamSchema, "params"),
  validateAll(updateVehicleBodySchema),
  updateMyVehicle
);
router.delete("/:id", validateAll(idParamSchema, "params"), deleteMyVehicle);

export default router;
