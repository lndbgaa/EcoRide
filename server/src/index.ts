import config from "@/config/app.js";
import connectMongo from "@/config/mongo.js";
import { connectMySQL } from "@/config/mysql.js";
import express from "express";

const app = express();
const PORT = config.server.port;

app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur!");
});

const start = async () => {
  try {
    await connectMySQL();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`✅ Serveur: Démarrage réussi sur le port ${PORT}`);
    });
  } catch (err) {
    console.error(`Erreur démarrage serveur: ${(err as Error).message}`);
    process.exit(1);
  }
};

start();
