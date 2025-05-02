import PreferenceService from "@/services/preference.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

/**
 * Gère la récupération des préférences de l'utilisateur connecté
 */
export const getUserPreferences = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const preferences = await PreferenceService.getPreferences(userId);

    const dto = preferences.map((preference) => preference.toPrivateDTO());

    res.status(200).json({
      success: true,
      message: "Préférences récupérées avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère l'ajout d'une préférence par l'utilisateur connecté
 */
export const addPreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const preference = await PreferenceService.createPreference(userId, data);

    const dto = preference.toPrivateDTO();

    res.status(201).json({
      success: true,
      message: "Préférence ajoutée avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère la mise à jour de la valeur d'une préférence par l'utilisateur connecté
 */
export const updatePreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const preferenceId = req.params.id;

    const updatedPreference = await PreferenceService.togglePreferenceValue(
      userId,
      preferenceId
    );

    const dto = updatedPreference.toPrivateDTO();

    res.status(200).json({
      success: true,
      message: "Préférence mise à jour avec succès.",
      data: dto,
    });
  }
);

/**
 * Gère la suppression d'une préférence par l'utilisateur connecté
 */
export const deletePreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const preferenceId = req.params.id;

    await PreferenceService.deletePreference(userId, preferenceId);

    res
      .status(200)
      .json({ success: true, message: "Préférence supprimée avec succès." });
  }
);
