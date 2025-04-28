import cloudinary from "@/config/cloudinary.config";
import AppError from "@/utils/AppError";
import dataUriFromFile from "@/utils/dataUriFromFile";

class UploadService {
  private static readonly allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  public static async uploadImage(file: Express.Multer.File, path: string) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Format d'image non supporté. Formats acceptés : JPG, PNG.",
      });
    }

    const file64 = dataUriFromFile(file);

    const result = await cloudinary.uploader.upload(file64.content!, {
      public_id: path,
      folder: path,
      overwrite: true,
      resource_type: "image",
    });

    return result;
  }
}

export default UploadService;
