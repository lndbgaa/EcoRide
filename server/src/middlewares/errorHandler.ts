import { getReasonPhrase } from "http-status-codes";
import Joi from "joi";

import { appConfig } from "@/config";
import { COMMON_ERROR_CODES, COMMON_ERROR_MESSAGES } from "@/constants";
import { AppError, logger, parseJoiError } from "@/utils";

import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const path = req.originalUrl;
  const method = req.method;
  const isDev = appConfig.env === "development";
  const userId = req.user?.id;

  // Handle custom application errors (AppError)
  if (err instanceof AppError) {
    const { statusCode, statusText, userMessageKey, userMessageParams, debugMessage, code, debugCode, stack } = err;
    const level = statusCode < 500 ? "warn" : "error";
    const message = req.t(userMessageKey, userMessageParams);

    logger[level](message, {
      statusCode,
      statusText,
      code,
      debugCode,
      path,
      method,
      userId,
      ...(isDev && { debugMessage, stack }),
    });

    return res.status(statusCode).json({
      success: false,
      statusCode,
      code,
      message,
      ...(isDev && { debugCode, debug: debugMessage }),
    });
  }

  // Handle Joi validation errors
  if (err instanceof Joi.ValidationError) {
    const statusCode = 400;
    const statusText = getReasonPhrase(statusCode);
    const message = req.t(COMMON_ERROR_MESSAGES.VALIDATION_ERROR);
    const code = COMMON_ERROR_CODES.VALIDATION_ERROR;

    const errors = parseJoiError(err).map((e) => ({
      field: e.field,
      message: req.t(e.messageKey, e.context),
      type: e.type,
    }));

    logger.warn(message, {
      statusCode,
      statusText,
      code,
      path,
      method,
      userId,
      errors,
    });

    return res.status(statusCode).json({
      success: false,
      statusCode,
      code,
      message,
      errors,
    });
  }

  // Handle unexpected errors
  const statusCode = 500;
  const statusText = getReasonPhrase(statusCode);
  const message = req.t(COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  const code = COMMON_ERROR_CODES.INTERNAL_ERROR;
  const debugMessage = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error(message, {
    statusCode,
    statusText,
    code,
    path,
    method,
    userId,
    ...(isDev && { debugMessage, stack }),
  });

  return res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    ...(isDev && { debug: debugMessage }),
  });
};

export { errorHandler };
