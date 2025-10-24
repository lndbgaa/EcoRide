import express from "express";
import { handle } from "i18next-http-middleware";

import appConfig from "@/config/app.config.js";
import i18next from "@/config/i18next.config.js";
import { connectMongoDB } from "@/config/mongo.config.js";
import { connectMySQL } from "@/config/mysql.config.js";

import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error.constants.js";
import errorHandler from "@/middlewares/errorHandler.js";
import AppError from "@/utils/AppError.js";
import logger from "@/utils/logger.js";

const app = express();
const PORT = appConfig.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handle(i18next));

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

app.use((req, res, next) => {
  next(
    new AppError({
      statusCode: 404,
      userMessage: ERROR_MESSAGES.COMMON.RESOURCE_NOT_FOUND,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
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
