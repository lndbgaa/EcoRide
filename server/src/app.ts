import cookieParser from "cookie-parser";
import express from "express";

import config from "@/config/app.config.js";
import connectMongo from "@/config/mongo.config.js";
import { connectMySQL } from "@/config/mysql.config.js";
import errorHandler from "@/middlewares/errorHandler.js";
import requireAuth from "@/middlewares/requireAuth.js";
import adminRoutes from "@/routes/admin.route.js";
import authRoutes from "@/routes/auth.route.js";
import bookingsRoutes from "@/routes/bookings.routes.js";
import ridesRoutes from "@/routes/rides.routes.js";
import usersRoutes from "@/routes/users.route.js";
import AppError from "@/utils/AppError.js";
import employeesRoutes from "./routes/employees.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";

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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/employees", employeesRoutes);
app.use("/api/v1/rides", ridesRoutes);
app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);

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
