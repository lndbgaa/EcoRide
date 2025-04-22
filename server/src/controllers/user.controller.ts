import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import User from "@/models/mysql/User.model.js";
import AccountService from "@/services/account.service.js";
import uploadImage from "@/services/upload.service.js";
import type { MulterRequest } from "@/types/express.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";
import { generateToken } from "@/utils/jwt.utils.js";
import type { Request, Response } from "express";

/**
 * Gère l'inscription d'un utilisateur standard
 *
 */
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { email, pseudo, password, firstName, lastName } = req.body;

  const emailExists = await AccountService.isEmailTaken(email);

  if (emailExists) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Un compte avec cet email existe déjà.",
    });
  }

  const pseudoExists = await AccountService.isPseudoTaken(pseudo);

  if (pseudoExists) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Le pseudo est déjà pris.",
    });
  }

  const newUser = await User.createOne({
    email,
    pseudo,
    password,
    first_name: firstName,
    last_name: lastName,
  });

  const jwt = generateToken({ id: newUser.id, role: ACCOUNT_ROLES_LABEL.USER });

  return res.status(200).json({ success: true, user: newUser.toPrivateJSON(), token: jwt });
});

/**
 * Met à jour la photo de profil d'un utilisateur
 */
export const updateProfilePicture = catchAsync(
  async (req: MulterRequest, res: Response): Promise<void> => {
    const { id } = req.params;

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

    const updatedRows = await User.updateOne(id, { profile_picture: secure_url });

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
