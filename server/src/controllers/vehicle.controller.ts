import VehicleService from "@/services/vehicle.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

/**
 * Gère la création d'un véhicule par l'utilisateur connecté
 */
export const addVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const vehicle = await VehicleService.createVehicle(userId, data);

    const dto = vehicle.toPrivateDTO();

    res.status(201).json({
      success: true,
      message: "Véhicule créé avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère la récupération des véhicules de l'utilisateur connecté
 */
export const getMyVehicles = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const vehicles = await VehicleService.getUserVehicles(userId);

    const dto = vehicles.map((vehicle) => vehicle.toPrivateDTO());

    res.status(200).json({
      success: true,
      message: "Véhicules récupérés avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère la mise à jour d'un véhicule par l'utilisateur connecté
 */
export const updateVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const vehicleId = req.params.id;
    const data = req.body;

    const updatedVehicle = await VehicleService.updateVehicle(
      userId,
      vehicleId,
      data
    );

    const dto = updatedVehicle.toPrivateDTO();

    res.status(200).json({
      success: true,
      message: "Véhicule mis à jour avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère la suppression d'un véhicule par l'utilisateur connecté
 */
export const deleteVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    await VehicleService.deleteVehicle(userId, vehicleId);

    res.sendStatus(204);
  }
);
