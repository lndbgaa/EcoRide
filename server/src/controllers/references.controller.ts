import { SUCCESS_MESSAGES } from "@/constants";
import { ReferenceService } from "@/services";
import { catchAsync } from "@/utils";

import type { VehicleBrand, VehicleColor, VehicleEnergy } from "@/models";
import type { PreferenceCategoryKey } from "@/types";
import type { Request, Response } from "express";

export const getVehicleBrands = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const brands: VehicleBrand[] = await ReferenceService.getAllBrands();
  const dto = brands.map((b) => b.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REFERENCE.VEHICLE_BRANDS_RETRIEVED),
    data: dto,
  });
});

export const getVehicleColors = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const colors: VehicleColor[] = await ReferenceService.getAllColors();
  const dto = colors.map((c) => c.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REFERENCE.VEHICLE_COLORS_RETRIEVED),
    data: dto,
  });
});

export const getVehicleEnergies = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const energies: VehicleEnergy[] = await ReferenceService.getAllEnergies();
  const dto = energies.map((e) => e.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REFERENCE.VEHICLE_ENERGIES_RETRIEVED),
    data: dto,
  });
});

export const getPreferenceOptionsByCategory = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const categoryKey = req.params.categoryKey! as PreferenceCategoryKey;

  const options = await ReferenceService.getPreferenceOptions(categoryKey);
  const dto = options.map((o) => o.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(""),
    data: dto,
  });
});
