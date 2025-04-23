import type { MulterRequest } from "@/types/express.js";
import type { Response } from "express";

import User from "@/models/mysql/User.model.js";
import uploadImage from "@/services/upload.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la mise à jour de la photo de profil d'un utilisateur
 */
export const updateProfilePicture = catchAsync(
  async (req: MulterRequest, res: Response): Promise<void> => {
    const { id } = req.user.id;

    if (!id) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "L'identifiant de l'utilisateur est requis.",
      });
    }

    const { file } = req;

    if (!file) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Aucun fichier n'a été uploadé.",
      });
    }

    const { secure_url } = await uploadImage(file, `ecoride/users/${id}/profile-picture`);

    const updatedRows = await User.updateByField("id", id, { profile_picture: secure_url });

    if (updatedRows === 0) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Utilisateur introuvable ou image non mise à jour.",
      });
    }

    res.status(200).json({ success: true, url: secure_url });
  }
);
