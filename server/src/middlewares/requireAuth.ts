import { appConfig } from "@/config";
import { DEBUG_CODES, ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import { AppError, validateJwt } from "@/utils";

import type { NextFunction, Request, Response } from "express";

const { auth } = appConfig;
const { accessSecret } = auth;

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(
      new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
        debugMessage: "Missing or invalid authorization header",
        code: ERROR_CODES.AUTH.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.HEADER_MISSING,
      })
    );
  }

  const token = authHeader.substring(7);

  if (!token) {
    return next(
      new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
        debugMessage: "Missing authentication token",
        code: ERROR_CODES.AUTH.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.ACCESS_TOKEN_MISSING,
      })
    );
  }

  try {
    const decoded = validateJwt(token, accessSecret);
    req.user = decoded;

    return next();
  } catch (err) {
    return next(err);
  }
};

export { requireAuth };
