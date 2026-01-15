import { Router } from "express";

import { getPreferenceOptionsByCategory, getVehicleBrands, getVehicleColors, getVehicleEnergies } from "@/controllers";
import { validateAll } from "@/middlewares";
import { preferenceCategoryKeyParamSchema } from "@/validations";

const router = Router();

router.get("/vehicles/brands", getVehicleBrands);
router.get("/vehicles/colors", getVehicleColors);
router.get("/vehicles/energies", getVehicleEnergies);

router.get(
  "/preferences/categories/:categoryKey/options",
  validateAll(preferenceCategoryKeyParamSchema, "params"),
  getPreferenceOptionsByCategory
);

export default router;
