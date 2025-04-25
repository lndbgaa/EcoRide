import cookieParser from "cookie-parser";
import express from "express";

import config from "@/config/app.config.js";
import connectMongo from "@/config/mongo.config.js";
import { connectMySQL } from "@/config/mysql.config.js";
import errorHandler from "@/middlewares/errorHandler.js";
import requireAuth from "@/middlewares/requireAuth.js";
import adminRoutes from "@/routes/admin.route.js";
import authRoutes from "@/routes/auth.route.js";
import ridesRoutes from "@/routes/rides.routes.js";
import userRoutes from "@/routes/user.route.js";
import AppError from "@/utils/AppError.js";

const app = express();
const PORT = config.server.port;

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur!");
});

app.get("/test", requireAuth, (req, res) => {
  res.send("Bienvenue!");
});

app.use("/api/v1/auth", authRoutes); // route pour l'authentification
app.use("/api/v1/user", userRoutes); // route pour les utilisateurs
app.use("/api/v1/admin", adminRoutes); // route pour les administrateurs
app.use("/api/v1/rides", ridesRoutes); // route pour les trajets

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
