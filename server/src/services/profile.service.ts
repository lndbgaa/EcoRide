import { UniqueConstraintError } from "sequelize";

import { appConfig } from "@/config";
import { AUTH_ERROR_MESSAGES, USER_ERROR_MESSAGES } from "@/constants";
import { UploadService } from "@/services";
import { AppError } from "@/utils";

import type { User } from "@/models";
import type { UpdateUserInfoPayload, UpdateUserPasswordPayload } from "@/types";

const { env } = appConfig;

export class ProfileService {
  /**
   * Updates the profile information of a user.
   *
   * @param {User} user - The user instance to update.
   * @param {UpdateUserInfoPayload} data - The new profile data.
   * @returns {Promise<User>} The updated user instance.
   * @throws {AppError} 409 if new username is already in use.
   * @throws {AppError} 400 if update fails due to invalid or unchanged data (from user.updateProfile).
   */
  public static async updateProfile(user: User, data: UpdateUserInfoPayload): Promise<User> {
    try {
      return await user.updateProfile(data);
    } catch (err) {
      if (err instanceof UniqueConstraintError && err.errors[0]?.path === "username") {
        throw new AppError({
          statusCode: 409,
          userMessageKey: AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
        });
      }
      throw err;
    }
  }

  /**
   * Updates the password of a user.
   *
   * @param {User} user - The user instance to update.
   * @param {UpdateUserPasswordPayload} data - The current and new passwords.
   * @returns {Promise<void>}
   * @throws {AppError} 400 if current password is incorrect.
   * @throws {AppError} 400 if new password is the same as the current one.
   */
  public static async updatePassword(user: User, data: UpdateUserPasswordPayload): Promise<void> {
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
   * @param {User} user - The user instance to update.
   * @param {Express.Multer.File} file - The uploaded image file.
   * @returns {Promise<{ url: string }>} The URL of the uploaded profile picture.
   * @throws {AppError} 400 if file type is invalid.
   * @throws {AppError} 400 if file size exceeds the maximum allowed limit.
   * @throws {AppError} 500 if image upload fails (from UploadService.uploadImage, e.g., Cloudinary error).
   */
  public static async updatePicture(user: User, file: Express.Multer.File): Promise<{ url: string }> {
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

    const folderPath = `ecoride/${env}/users/${user.id}/profile_picture`;
    const { secure_url } = await UploadService.uploadImage(file, folderPath);

    await user.update({ profile_picture: secure_url });

    return { url: secure_url };
  }
}
