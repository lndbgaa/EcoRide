import type { Preference, User, Vehicle } from "@/models/mysql";
import type { MulterRequest } from "@/types/express.js";
import type { CreatePreferenceData } from "@/types/preference.types.js";
import type { UpdateUserData, UserRole } from "@/types/user.types.js";
import type { CreateVehicleData, UpdateVehicleData } from "@/types/vehicle.types.js";
import type { Request, Response } from "express";

import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

import PreferenceService from "@/services/preference.service.js";
import UserService from "@/services/user.service.js";
import VehicleService from "@/services/vehicle.service.js";

/**
 * Gère la récupération des informations de profil d'un utilisateur
 */
export const getUserInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user.id;

  const user: User = await UserService.getUserInfo(userId);

  res.status(200).json({
    success: true,
    message: "Informations de profil récupérées avec succès.",
    data: user.toPrivateDTO(),
  });
});

/**
 * Gère la mise à jour des informations de profil d'un utilisateur
 */
export const updateUserInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user.id;
  const data: UpdateUserData = req.body;

  const user: User = await UserService.updateInfo(userId, data);

  res.status(200).json({
    success: true,
    message: "Informations de profil modifiées avec succès.",
    data: user.toPrivateDTO(),
  });
});

/**
 * Gère la mise à jour du rôle d'un utilisateur
 */
export const updateUserRole = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user.id;
  const { role }: { role: UserRole } = req.body;

  await UserService.updateRole(role, userId);

  res.status(200).json({ success: true, message: "Rôle mis à jour avec succès." });
});

/**
 * Gère la mise à jour de la photo de profil d'un utilisateur
 */
export const updateUserAvatar = catchAsync(
  async (req: MulterRequest, res: Response): Promise<void> => {
    const userId: string = req.user.id;

    const { file } = req;

    if (!file) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Aucun fichier n'a été uploadé.",
      });
    }

    const { url } = await UserService.updateAvatar(file, userId);

    res.status(200).json({
      success: true,
      message: "Photo de profil mise à jour avec succès.",
      data: { avatar: url },
    });
  }
);

/**
 * Gère la récupération des véhicules d'un utilisateur (chauffeur)
 */
export const getUserVehicles = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user.id;

  const vehicles: Vehicle[] = await VehicleService.getVehicles(userId);

  res.status(200).json({
    success: true,
    message: "Véhicules récupérés avec succès.",
    data: vehicles.map((vehicle) => vehicle.toPrivateDTO()),
  });
});

/**
 * Gère la création d'un véhicule par un utilisateur (chauffeur)
 */
export const addVehicleToProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const data: CreateVehicleData = req.body;

    const vehicle: Vehicle = await VehicleService.createVehicle(userId, data);

    res.status(201).json({
      success: true,
      message: "Véhicule créé avec succès.",
      data: vehicle.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour d'un véhicule par un utilisateur (chauffeur)
 */
export const updateVehicleFromProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const vehicleId: string = req.params.vehicleId;
    const data: UpdateVehicleData = req.body;

    const updatedVehicle: Vehicle = await VehicleService.updateVehicle(userId, vehicleId, data);

    res.status(200).json({
      success: true,
      message: "Véhicule mis à jour avec succès.",
      data: updatedVehicle.toPrivateDTO(),
    });
  }
);

/**
 * Gère la suppression d'un véhicule par un utilisateur (chauffeur)
 */
export const deleteVehicleFromProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const vehicleId: string = req.params.vehicleId;

    await VehicleService.deleteVehicle(userId, vehicleId);

    res.status(200).json({ success: true, message: "Véhicule supprimé avec succès." });
  }
);

/**
 * Gère la récupération des préférences d'un utilisateur (chauffeur)
 */
export const getUserPreferences = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.user.id;

  const preferences: Preference[] = await PreferenceService.getPreferences(userId);

  res.status(200).json({
    success: true,
    message: "Préférences récupérées avec succès.",
    data: preferences.map((preference) => preference.toPrivateDTO()),
  });
});

/**
 * Gère l'ajout d'une préférence par un utilisateur (chauffeur)
 */
export const addPreferenceToProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const data: CreatePreferenceData = req.body;

    const preference: Preference = await PreferenceService.createPreference(userId, data);

    res.status(201).json({
      success: true,
      message: "Préférence ajoutée avec succès.",
      data: preference.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour de la valeur d'une préférence par un utilisateur (chauffeur)
 */
export const updatePreferenceFromProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const preferenceId: string = req.params.preferenceId;

    const updatedPreference: Preference = await PreferenceService.togglePreferenceValue(
      userId,
      preferenceId
    );

    res.status(200).json({
      success: true,
      message: "Préférence mise à jour avec succès.",
      data: updatedPreference.toPrivateDTO(),
    });
  }
);

/**
 * Gère la suppression d'une préférence par un utilisateur (chauffeur)
 */
export const deletePreferenceFromProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.id;
    const preferenceId: string = req.params.preferenceId;

    await PreferenceService.deletePreference(userId, preferenceId);

    res.status(200).json({ success: true, message: "Préférence supprimée avec succès." });
  }
);
