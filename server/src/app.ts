import config from "@/config/app.js";
import connectMongo from "@/config/mongo.js";
import { connectMySQL } from "@/config/mysql.js";
import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/AppError.js";

const app = express();
const PORT = config.server.port;

app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur!");
});

app.use((req, res, next) => {
  next(
    new AppError({
      statusCode: 404,
      statusText: "Non trouvé",
      message: "La ressource demandée n'a pas été trouvée.",
      details: {
        path: req.originalUrl,
        method: req.method,
      },
    })
  );
});

app.use(errorHandler);

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
