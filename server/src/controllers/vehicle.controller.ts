import { SUCCESS_MESSAGES } from "@/constants";
import { VehicleService } from "@/services/vehicle.service";
import { catchAsync } from "@/utils";

import type { CreateVehiclePayload, UpdateVehiclePayload } from "@/types";
import type { Request, Response } from "express";

// ============================================
// 🔍 READ
// ============================================

/**
 * Retrieve the authenticated user's vehicles.
 */
export const getVehicles = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const vehicles = await VehicleService.getUserVehicles(userId);
  const dto = vehicles.map((v) => v.toPrivateDTO());

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.RETRIEVED_ALL),
    data: dto,
  });
});

/**
 * Retrieve a specific vehicle owned by the authenticated user.
 */
export const getVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const vehicleId = req.params.id!;

  const vehicle = await VehicleService.findOwnedVehicleById(userId, vehicleId);
  const dto = vehicle.toPrivateDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.RETRIEVED),
    data: dto,
  });
});

// ============================================
// ➕ CREATE
// ============================================

/**
 * Create a new vehicle for the authenticated user.
 */
export const createVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: CreateVehiclePayload = req.body;

  const vehicle = await VehicleService.createVehicle(userId, data);
  const dto = vehicle.toPrivateDTO();

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.CREATED),
    data: dto,
  });
});

// ============================================
// 🚦 UPDATE
// ============================================

/**
 * Update a specific vehicle owned by the authenticated user.
 */
export const updateVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const vehicleId = req.params.id!;
  const data: UpdateVehiclePayload = req.body;

  const vehicle = await VehicleService.updateVehicle(userId, vehicleId, data);
  const dto = vehicle.toPrivateDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.UPDATED),
    data: dto,
  });
});

// ============================================
//  ❌ DELETE
// ============================================

/**
 * Delete a specific vehicle owned by the authenticated user.
 */
export const deleteVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const vehicleId = req.params.id!;

  await VehicleService.deleteVehicle(userId, vehicleId);

  return res.sendStatus(204);
});
