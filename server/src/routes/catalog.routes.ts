import { Router } from "express";

const router = Router();

import { getVehicleBrands, getVehicleColors, getVehicleEnergies } from "@/controllers/catalog.controller.js";

router.get("/vehicle-brands", getVehicleBrands);
router.get("/vehicle-colors", getVehicleColors);
router.get("/vehicle-energies", getVehicleEnergies);

export default router;
