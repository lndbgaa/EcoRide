import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectMongo = async (): Promise<void> => {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    console.error(
      "❌ URI MongoDB manquante dans les variables d'environnement."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ Connexion à MongoDB réussie`);
  } catch (error) {
    console.error("❌ Erreur de connexion à la base MongoDB:", error);
    process.exit(1);
  }
};

export default connectMongo;
