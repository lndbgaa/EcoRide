import Joi from "joi";

import config from "@/config/app.config.js";
import AppError from "@/utils/AppError.js";
import logError from "@/utils/logError.js";

import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

/**
 * Middleware de gestion des erreurs
 */
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
      details: config.env === "development" && details,
    });
  } else if (err instanceof Joi.ValidationError) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      statusText: "Bad Request",
      errors: err.details.map((detail) => detail.message),
    });
  } else {
    const statusCode = 500;
    const statusText = "Internal Server Error";
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
