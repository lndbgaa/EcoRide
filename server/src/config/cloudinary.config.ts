import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

import { getEnvVar } from "@/config/app.config.js";

cloudinary.config({
  cloud_name: getEnvVar("CLOUDINARY_CLOUD_NAME"),
  api_key: getEnvVar("CLOUDINARY_KEY"),
  api_secret: getEnvVar("CLOUDINARY_SECRET"),
});

export default cloudinary;
