import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(customParseFormat);

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import config from "@/config/app.config.js";
import connectMongo from "@/config/mongo.config.js";
import { connectMySQL } from "@/config/mysql.config.js";
import errorHandler from "@/middlewares/errorHandler.js";
import { globalLimiter } from "@/middlewares/rateLimiter.js";
import sanitizeAll from "@/middlewares/sanitizeAll.js";
import adminRoutes from "@/routes/admin.route.js";
import authRoutes from "@/routes/auth.route.js";
import bookingsRoutes from "@/routes/booking.route.js";
import catalogRoutes from "@/routes/catalog.routes.js";
import employeesRoutes from "@/routes/employee.route.js";
import incidentsRoutes from "@/routes/incident.route.js";
import preferencesRoutes from "@/routes/preference.route.js";
import publicRoutes from "@/routes/public.route.js";
import reviewsRoutes from "@/routes/review.route.js";
import ridesRoutes from "@/routes/ride.route.js";
import userPrivateRoutes from "@/routes/user.route.js";
import vehiclesRoutes from "@/routes/vehicle.route.js";
import AppError from "@/utils/AppError.js";

const app = express();
const PORT = config.port;

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeAll);
app.use(globalLimiter);
app.use(cors(config.cors));
app.use(helmet({ contentSecurityPolicy: false }));

app.get("/", (req, res) => {
  res.send("Bienvenue sur le serveur!");
});

console.log(config.env);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users/me", userPrivateRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/employees", employeesRoutes);
app.use("/api/v1/vehicles", vehiclesRoutes);
app.use("/api/v1/preferences", preferencesRoutes);
app.use("/api/v1/rides", ridesRoutes);
app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/incidents", incidentsRoutes);
app.use("/api/v1/catalog", catalogRoutes);

app.use("/api/v1/", publicRoutes);

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
