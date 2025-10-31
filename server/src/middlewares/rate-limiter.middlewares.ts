import { rateLimit } from "express-rate-limit";

import { COMMON_ERROR_MESSAGES } from "@/constants";
import { AppError } from "@/utils";

import type { NextFunction, Request, Response } from "express";
import type { RateLimitRequestHandler } from "express-rate-limit";

const rateLimitHandler = (req: Request, res: Response, next: NextFunction, messageKey: string): void => {
  next(
    new AppError({
      statusCode: 429,
      userMessageKey: messageKey,
    })
  );
};

const createRateLimiter = (windowMs: number, limit: number, messageKey: string): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => rateLimitHandler(req, res, next, messageKey),
  });
};

export const defaultLimiter = createRateLimiter(
  15 * 60 * 1000,
  500,
  COMMON_ERROR_MESSAGES.RATE_LIMIT.DEFAULT
);

export const registerLimiter = createRateLimiter(
  10 * 60 * 1000,
  5,
  COMMON_ERROR_MESSAGES.RATE_LIMIT.REGISTER
);

export const loginLimiter = createRateLimiter(10 * 60 * 1000, 5, COMMON_ERROR_MESSAGES.RATE_LIMIT.LOGIN);

export const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  COMMON_ERROR_MESSAGES.RATE_LIMIT.PASSWORD_RESET
);
