import { cloudinary } from "@/config";
import { COMMON_ERROR_MESSAGES } from "@/constants";
import { AppError, dataUriFromBuffer } from "@/utils";

import type { UploadApiResponse } from "cloudinary";

export class UploadService {
  /**
   * Uploads an image to Cloudinary.
   *
   * @param {Express.Multer.File} file - The image file to upload.
   * @param {string} path - The path in Cloudinary where the image will be stored (used as folder and public_id).
   * @returns {Promise<UploadApiResponse>} The response from Cloudinary containing the uploaded image details.
   * @throws {AppError} - If:
   *   - The upload fails (HTTP 500, e.g., network issues, Cloudinary error).
   */
  public static async uploadImage(file: Express.Multer.File, path: string): Promise<UploadApiResponse> {
    const content = dataUriFromBuffer(file.buffer, file.filename);

    try {
      return await cloudinary.uploader.upload(content, {
        public_id: path,
        folder: path,
        overwrite: true,
        resource_type: "image",
      });
    } catch (err) {
      throw new AppError({
        statusCode: 500,
        userMessageKey: COMMON_ERROR_MESSAGES.UPLOAD.IMAGE.FAILED,
        debugMessage: (err as Error).message,
      });
    }
  }
}
