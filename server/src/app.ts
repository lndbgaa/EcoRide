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
import { handle } from "i18next-http-middleware";

import { appConfig, connectMongoDB, connectMySQL, i18next } from "@/config";
import { COMMON_ERROR_MESSAGES } from "@/constants";
import { scheduleAllJobs } from "@/jobs";
import { defaultLimiter, errorHandler, sanitizeAll } from "@/middlewares";
import mainRouter from "@/routes";
import { AppError, logger } from "@/utils";

const { port, corsOptions } = appConfig;

const app = express();

app.use(handle(i18next));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors(corsOptions));
app.use(defaultLimiter);
app.use(sanitizeAll);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: req.t("app.name"),
    version: "1.0.0",
    message: req.t("app.welcome"),
    env: appConfig.env,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", mainRouter);

app.use((req, res, next) => {
  next(
    new AppError({
      statusCode: 404,
      userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
    })
  );
});

app.use(errorHandler);

const start = async () => {
  try {
    await connectMySQL();
    await connectMongoDB();

    app.listen(port, () => {
      logger.info(`✅ Server: Started successfully on port ${port}`);

      scheduleAllJobs();
      logger.info("⏱ Scheduled jobs started.");
    });
  } catch (err) {
    logger.error(`❌ Server startup error: ${(err as Error).message}`, {
      stack: (err as Error).stack,
    });
    process.exit(1);
  }
};

start();
