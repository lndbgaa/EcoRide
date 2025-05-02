import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

import type { MulterRequest } from "@/types/express.js";
import type { Request, Response } from "express";

/**
 * Gère la récupération des informations de profil d'un utilisateur
 */
export const getUserInfo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const user = await UserService.getUserInfo(userId);

    res.status(200).json({
      success: true,
      message: "Informations de profil récupérées avec succès.",
      data: user.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour des informations de profil d'un utilisateur
 */
export const updateUserInfo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const user = await UserService.updateInfo(userId, data);

    res.status(200).json({
      success: true,
      message: "Informations de profil mises à jour avec succès.",
      data: user.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour du rôle d'un utilisateur
 */
export const updateUserRole = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { role } = req.body;

    await UserService.updateRole(role, userId);

    res
      .status(200)
      .json({ success: true, message: "Rôle mis à jour avec succès." });
  }
);

/**
 * Gère la mise à jour de la photo de profil d'un utilisateur
 */
export const updateUserAvatar = catchAsync(
  async (req: MulterRequest, res: Response): Promise<void> => {
    const userId = req.user.id;

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
