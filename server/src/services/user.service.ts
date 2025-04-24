import type { UserInfo, UserRole } from "@/types/user.types.js";

import User from "@/models/mysql/User.model.js";
import AppError from "@/utils/AppError.js";
import uploadImage from "@/utils/upload.utils.js";

class UserService {
  private static async findUserOrThrow(userId: string) {
    const user = await User.findOneByField("id", userId);

    if (!user) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Utilisateur non trouvé.",
      });
    }

    return user;
  }

  public static async updateInfo(userId: string, data: UserInfo): Promise<UserInfo> {
    await this.findUserOrThrow(userId);

    // formatage des données à mettre à jour avant de les envoyer à la base de données
    const dataToUpdate = {
      ...(data.firstName && { first_name: data.firstName }),
      ...(data.lastName && { last_name: data.lastName }),
      ...(data.birthDate && { birth_date: data.birthDate }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
      ...(data.pseudo && { pseudo: data.pseudo }),
    };

    await User.updateByField("id", userId, dataToUpdate);

    // formatage des données à retourner avant de les envoyer au client
    const result: UserInfo = {};
    if (data.firstName) result.firstName = data.firstName;
    if (data.lastName) result.lastName = data.lastName;
    if (data.birthDate) result.birthDate = data.birthDate;
    if (data.phone) result.phone = data.phone;
    if (data.address) result.address = data.address;
    if (data.pseudo) result.pseudo = data.pseudo;

    return result;
  }

  public static async updateRole(role: UserRole, userId: string) {
    const user = await this.findUserOrThrow(userId);

    if (role === "driver") {
      await user.toggleDriver();
    } else {
      await user.togglePassenger();
    }
  }

  public static async updateAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<{ url: string }> {
    await this.findUserOrThrow(userId);

    const { secure_url } = await uploadImage(file, `ecoride/users/${userId}/profile-picture`);

    await User.updateByField("id", userId, {
      profile_picture: secure_url,
    });

    return { url: secure_url };
  }
}

export default UserService;
