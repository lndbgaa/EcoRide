import { v2 as cloudinary } from "cloudinary";

import { appConfig } from "@/config";

const { cloudName, apiKey, apiSecret } = appConfig.cloudinary;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export { cloudinary };
