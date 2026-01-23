import { appConfig } from "@/config";
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES, DEBUG_CODES } from "@/constants";
import { UserService } from "@/services";
import { AppError, validateJwt } from "@/utils";

import type { NextFunction, Request, Response } from "express";

const { accessSecret } = appConfig.auth;

const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.substring(7);

  if (!token) return next();

  try {
    const decoded = validateJwt(token, accessSecret);

    const user = await UserService.findById(decoded.id, {
      include: [{ association: "role" }],
    });

    if (!user) {
      return next(
        new AppError({
          statusCode: 401,
          userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
          debugMessage: "Authenticated user not found in database.",
          code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
          debugCode: DEBUG_CODES.AUTH.USER_NOT_FOUND,
        })
      );
    }

    req.user = user;
    return next();
  } catch (err: any) {
    if (err.code === AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED) {
      return next(err);
    }

    req.user = undefined;
    return next();
  }
};

export { optionalAuth };
