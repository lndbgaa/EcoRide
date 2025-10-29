import { getReasonPhrase } from "http-status-codes";

import { ERROR_MESSAGES } from "@/constants";

import type { AppErrorOptions } from "@/types";

class AppError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly userMessage: string;
  public readonly debugMessage?: string;
  public readonly code?: string;
  public readonly debugCode?: string;
  public readonly isOperational: boolean;

  private static resolveStatusText(statusCode: number): string {
    try {
      return getReasonPhrase(statusCode);
    } catch {
      return statusCode >= 500 ? "Internal Server Error" : "Bad Request";
    }
  }

  constructor({
    statusCode = 500,
    statusText,
    userMessage = ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    debugMessage,
    code,
    debugCode,
    isOperational = true,
  }: AppErrorOptions) {
    super(userMessage);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.statusText = statusText || AppError.resolveStatusText(statusCode);
    this.userMessage = userMessage;
    this.debugMessage = debugMessage;
    this.code = code;
    this.debugCode = debugCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
