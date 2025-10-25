import mongoose from "mongoose";

import { appConfig } from "@/config";
import { logger } from "@/utils";

const { mongodb } = appConfig;
const { uri } = mongodb;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(uri);
    logger.info("✅ MongoDB: Connection successful");
  } catch (err) {
    throw new Error(`❌ Failed to connect to MongoDB: ${(err as Error).message}`);
  }
};

export { connectMongoDB };
