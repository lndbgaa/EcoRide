import mongoose from "mongoose";

import config from "@/config/app.config.js";

const connectMongo = async (): Promise<void> => {
  const uri = config.mongo.uri;

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB: Connexion réussie");
  } catch (err) {
    throw new Error(`❌ Échec de connexion à MongoDB: ${(err as Error).message}`);
  }
};

export default connectMongo;
