import VehicleService from "@/services/vehicle.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

export const getVehicleBrands = catchAsync(async (req: Request, res: Response) => {
  const brands = await VehicleService.getVehicleBrands();
  res.status(200).json(brands);
});

export const getVehicleColors = catchAsync(async (req: Request, res: Response) => {
  const colors = await VehicleService.getVehicleColors();
  res.status(200).json(colors);
});

export const getVehicleEnergies = catchAsync(async (req: Request, res: Response) => {
  const energies = await VehicleService.getVehicleEnergies();
  res.status(200).json(energies);
});
