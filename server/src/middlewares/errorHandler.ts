import config from "@/config/app.js";
import AppError from "@/utils/AppError.js";
import logError from "@/utils/logError.js";
import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    const { statusCode, statusText, message, details, stack } = err;

    logError({ errorType: "AppError", statusCode, statusText, message, details, stack });

    res.status(statusCode).json({
      success: false,
      statusCode,
      statusText,
      message,
      details: config.server.env === "development" && details,
    });
  } else {
    const statusCode = 500;
    const statusText = "Erreur interne au serveur";
    const message = err.message || "Une erreur inattendue s'est produite.";
    const stack = err.stack ?? null;

    logError({ errorType: "Erreur inattendue", statusCode, statusText, message, stack });

    res.status(statusCode).json({
      success: false,
      statusCode,
      statusText,
      message,
    });
  }
};

export default errorHandler;
