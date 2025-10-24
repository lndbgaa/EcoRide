import mongoose from "mongoose";

import appConfig from "@/config/app.config.js";

const { mongodb } = appConfig;
const { uri } = mongodb;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB: Connection successful");
  } catch (err) {
    throw new Error(`❌ Failed to connect to MongoDB: ${(err as Error).message}`);
  }
};

export { connectMongoDB };
