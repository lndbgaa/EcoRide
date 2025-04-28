import type { UserRole } from "@/types/index.js";
import type { FindOptions } from "sequelize";

import User from "@/models/mysql/User.model.js";
import UploadService from "@/services/upload.service.js";
import AppError from "@/utils/AppError.js";

class UserService {
  /**
   * Vérifie si un utilisateur existe et le retourne
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async findUserOrThrow(userId: string, options?: FindOptions): Promise<User> {
    const user = await User.findOneByField("id", userId, options);

    if (!user) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Utilisateur non trouvé. Veuillez vérifier l'id de l'utilisateur.",
      });
    }

    return user;
  }

  /**
   * Vérifie si un utilisateur est chauffeur
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async assertUserIsDriverOrThrow(
    userId: string,
    options?: FindOptions
  ): Promise<User> {
    const user = await UserService.findUserOrThrow(userId, options);

    if (!user.isDriver()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Seuls les utilisateurs chauffeurs peuvent accéder à cette ressource. ",
      });
    }

    return user;
  }

  /**
   * Vérifie si un utilisateur est passager
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async assertUserIsPassengerOrThrow(
    userId: string,
    options?: FindOptions
  ): Promise<User> {
    const user = await UserService.findUserOrThrow(userId, options);

    if (!user.isPassenger()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Seuls les utilisateurs passagers peuvent accéder à cette ressource.",
      });
    }

    return user;
  }

  /**
   * Récupère les informations d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les informations de l'utilisateur
   */
  public static async getUserInfo(userId: string): Promise<User> {
    const user = await this.findUserOrThrow(userId);
    return user;
  }

  /**
   * Met à jour les informations d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param data - Les données à mettre à jour
   * @returns Les informations de l'utilisateur mises à jour
   */
  public static async updateInfo(userId: string, data: any): Promise<User> {
    await this.findUserOrThrow(userId);

    // formatage des données à mettre à jour avant de les envoyer à la BDD
    const dataToUpdate = {
      ...(data.firstName && { first_name: data.firstName }),
      ...(data.lastName && { last_name: data.lastName }),
      ...(data.birthDate && { birth_date: data.birthDate }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
      ...(data.pseudo && { pseudo: data.pseudo }),
    };

    await User.updateByField("id", userId, dataToUpdate);

    const updatedUser = await User.findOneByField("id", userId);

    if (!updatedUser) {
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message:
          "Une erreur est survenue lors de la mise à jour des informations de l'utilisateur.",
      });
    }

    return updatedUser;
  }

  /**
   * Met à jour le rôle d'un utilisateur (chauffeur ou passager)
   * @param role - Le rôle à mettre à jour
   * @param userId - L'id de l'utilisateur
   */
  public static async updateRole(role: UserRole, userId: string): Promise<void> {
    const user = await this.findUserOrThrow(userId);

    if (role === "driver") {
      await user.toggleDriver();
    } else {
      await user.togglePassenger();
    }
  }

  /**
   * Met à jour l'avatar d'un utilisateur
   * @param file - Le fichier du nouvel avatar
   * @param userId - L'id de l'utilisateur
   * @returns L'url de l'avatar mis à jour
   */
  public static async updateAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<{ url: string }> {
    await this.findUserOrThrow(userId);

    const { secure_url } = await UploadService.uploadImage(
      file,
      `ecoride/users/${userId}/profile-picture`
    );

    await User.updateByField("id", userId, {
      profile_picture: secure_url,
    });

    return { url: secure_url };
  }
}

export default UserService;
