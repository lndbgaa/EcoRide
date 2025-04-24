import cloudinary from "@/config/cloudinary.config.js";
import AppError from "@/utils/AppError.js";
import dataUriFromFile from "@/utils/dataUriFromFile.js";

const uploadImage = async (file: Express.Multer.File, path: string) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Format d'image non supporté. Formats acceptés : JPG, PNG, WEBP.",
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
};

export default uploadImage;
