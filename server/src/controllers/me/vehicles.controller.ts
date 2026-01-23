import { SUCCESS_MESSAGES } from "@/constants";
import { VehicleService } from "@/services";
import { catchAsync } from "@/utils";

import type { CreateVehiclePayload, UpdateVehiclePayload } from "@/types";
import type { Request, Response } from "express";

/**
 * Retrieve the authenticated user's vehicles.
 */
export const getMyVehicles = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const vehicles = await VehicleService.getUserVehicles(user);
  const dto = vehicles.map((v) => v.toPrivateDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.RETRIEVED_ALL),
    data: dto,
  });
});

/**
 * Retrieve a specific vehicle owned by the authenticated user.
 */
export const getMyVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const vehicleId = req.params.id!;

  const vehicle = await VehicleService.findOwnedById(user, vehicleId);
  const dto = vehicle.toPrivateDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.RETRIEVED),
    data: dto,
  });
});

/**
 * Create a new vehicle for the authenticated user.
 */
export const createMyVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const data: CreateVehiclePayload = req.body;

  const vehicle = await VehicleService.create(user, data);
  const dto = vehicle.toPrivateDTO(req.t);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.CREATED),
    data: dto,
  });
});

/**
 * Update a specific vehicle owned by the authenticated user.
 */
export const updateMyVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const vehicleId = req.params.id!;
  const data: UpdateVehiclePayload = req.body;

  const vehicle = await VehicleService.updateVehicle(user, vehicleId, data);
  const dto = vehicle.toPrivateDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.UPDATED),
    data: dto,
  });
});

/**
 * Delete a specific vehicle owned by the authenticated user.
 */
export const deleteMyVehicle = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const vehicleId = req.params.id!;

  await VehicleService.deleteVehicle(user, vehicleId);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.VEHICLE.DELETED),
  });
});
