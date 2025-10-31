import { appConfig } from "@/config";
import { USER_ERROR_MESSAGES } from "@/constants";
import { AuthService, UploadService, UserService } from "@/services";
import { AppError } from "@/utils";

import type { User } from "@/models/mysql";
import type { UpdateUserInfoPayload, UpdateUserPasswordPayload } from "@/types";

const { env } = appConfig;

class UserProfileService {
  /**
   * Updates the profile information of a user.
   *
   * @param {string} userId - The ID of the user.
   * @param {UpdateUserInfoPayload} data - The new profile data.
   * @returns {Promise<User>} The updated user object.
   * @throws {AppError} - If:
   *   - The user is not found (thrown by UserService.findById)
   *   - The new username is already in use (thrown by AuthService.assertUsernameIsUnique)
   *   - The update fails due to invalid or unchanged data (thrown by user.updateProfile)
   */
  public static async updateProfile(userId: string, data: UpdateUserInfoPayload): Promise<User> {
    const user = await UserService.findById(userId, 500);

    if (data.username && data.username !== user.username) {
      await AuthService.assertUsernameIsUnique(data.username);
    }

    return user.updateProfile(data);
  }

  /**
   * Updates the password of a user.
   *
   * @param {string} userId - The ID of the user.
   * @param {UpdateUserPasswordPayload} data - The current and new passwords.
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The user is not found (thrown by UserService.findById)
   *   - The current password is incorrect
   *   - The new password is the same as the current one
   */
  public static async updatePassword(userId: string, data: UpdateUserPasswordPayload): Promise<void> {
    const user = await UserService.findById(userId, 500);

    const { currentPassword, newPassword } = data;

    if (!(await user.checkPassword(currentPassword))) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
      });
    }

    if (currentPassword === newPassword) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_OLD,
      });
    }

    user.password = newPassword;
    await user.save({ fields: ["password"] });
  }

  /**
   * Updates the profile picture of a user.
   *
   * @param {string} userId - The ID of the user.
   * @param {Express.Multer.File} file - The uploaded image file.
   * @returns {Promise<{ url: string }>} The URL of the uploaded profile picture.
   * @throws {AppError} - If:
   *   - The user is not found (thrown by UserService.findById)
   *   - The file type is invalid
   *   - The file size exceeds the maximum allowed limit
   *   - The image upload fails (thrown by UploadService.uploadImage, e.g., Cloudinary error)
   */
  public static async updatePicture(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    const user = await UserService.findById(userId, 500);

    const allowedImageMimedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedImageMimedTypes.includes(file.mimetype)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.PROFILE_PICTURE_INVALID_FILE_TYPE,
        debugMessage: `Invalid MIME type: ${file.mimetype}`,
      });
    }

    const maxImageSize = 5 * 1024 * 1024;

    if (file.size > maxImageSize) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.PROFILE_PICTURE_FILE_TOO_LARGE,
        debugMessage: `File size too large: ${file.size} bytes`,
      });
    }

    const folderPath = `ecoride/${env}/users/${userId}/profile_picture`;
    const { secure_url } = await UploadService.uploadImage(file, folderPath);

    await user.update({ profile_picture: secure_url });

    return { url: secure_url };
  }
}

export { UserProfileService };
