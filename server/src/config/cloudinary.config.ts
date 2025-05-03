import { v2 as cloudinary } from "cloudinary";

import config from "@/config/app.config.js";

const { cloud_name, api_key, api_secret } = config.cloudinary;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export default cloudinary;
