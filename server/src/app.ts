import cookieParser from "cookie-parser";
import express from "express";
import { handle } from "i18next-http-middleware";

import { appConfig, connectMongoDB, connectMySQL, i18next } from "@/config";
import { ERROR_MESSAGES } from "@/constants";
import { errorHandler } from "@/middlewares";
import router from "@/routes";
import { AppError, logger } from "@/utils";

const app = express();
const PORT = appConfig.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handle(i18next));
app.use(cookieParser());

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

app.use("/api/v1", router);

app.use((req, res, next) => {
  next(
    new AppError({
      statusCode: 404,
      userMessage: ERROR_MESSAGES.COMMON.RESOURCE_NOT_FOUND,
    })
  );
});

app.use(errorHandler);

const start = async () => {
  try {
    await connectMySQL();
    await connectMongoDB();

    app.listen(PORT, () => {
      logger.info(`✅ Server: Started successfully on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`❌ Server startup error: ${(err as Error).message}`, {
      stack: (err as Error).stack,
    });
    process.exit(1);
  }
};

start();
