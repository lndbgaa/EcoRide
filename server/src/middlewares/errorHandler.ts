import { getReasonPhrase } from "http-status-codes";
import Joi from "joi";

import { appConfig } from "@/config";
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import { AppError, logger, parseJoiError } from "@/utils";

import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const path = req.originalUrl;
  const method = req.method;
  const isDev = appConfig.env === "development";
  const userId = req.user?.id;

  if (err instanceof AppError) {
    const { statusCode, statusText, userMessage, debugMessage, code, stack } = err;
    const level = statusCode < 500 ? "warn" : "error";
    const message = req.t(userMessage);

    logger[level](message, {
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
      statusText,
      message,
      code,
      ...(isDev && { debug: debugMessage }),
    });
  }

  if (err instanceof Joi.ValidationError) {
    const statusCode = 400;
    const statusText = getReasonPhrase(statusCode);
    const message = req.t(ERROR_MESSAGES.COMMON.VALIDATION_ERROR);
    const code = ERROR_CODES.COMMON.VALIDATION_ERROR;
    const details = parseJoiError(err);

    logger.warn(message, {
      statusCode,
      statusText,
      code,
      path,
      method,
      userId,
      ...(isDev && details),
    });

    return res.status(statusCode).json({
      success: false,
      statusCode,
      statusText,
      message,
      code,
      ...(isDev && details),
    });
  }

  const statusCode = 500;
  const statusText = getReasonPhrase(statusCode);
  const message = req.t(ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);
  const code = ERROR_CODES.COMMON.INTERNAL_ERROR;
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
    statusText,
    message,
    code,
    ...(isDev && { debug: debugMessage }),
  });
};

export { errorHandler };
