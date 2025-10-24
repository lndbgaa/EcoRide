import { getReasonPhrase } from "http-status-codes";

import appConfig from "@/config/app.config.js";

import { ERROR_MESSAGES } from "@/constants/error.constants.js";

import type { AppErrorOptions } from "@/types/error.types.js";

class AppError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly userMessage: string;
  public readonly debugMessage?: string;
  public readonly code?: string;
  public readonly isOperational: boolean;

  private static resolveStatusText(code: number): string {
    try {
      return getReasonPhrase(code);
    } catch {
      return code >= 500 ? "Server Error" : "Client Error";
    }
  }

  constructor({
    statusCode = 500,
    statusText,
    userMessage = ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    debugMessage,
    code,
    isOperational = true,
  }: AppErrorOptions) {
    super(appConfig.env === "development" ? debugMessage || userMessage : userMessage);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.statusText = statusText || AppError.resolveStatusText(statusCode);
    this.userMessage = userMessage;
    this.debugMessage = debugMessage;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
