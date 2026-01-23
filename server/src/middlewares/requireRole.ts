import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES, DEBUG_CODES } from "@/constants";
import { AppError } from "@/utils";

import type { UserRoleKey } from "@/types";
import type { NextFunction, Request, Response } from "express";

const requireRole =
  (allowedRoles: UserRoleKey[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError({
          statusCode: 401,
          userMessageKey: AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
          debugMessage: "requireRole called without authenticated user.",
          code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
          debugCode: DEBUG_CODES.AUTH.USER_NOT_AUTHENTICATED,
        })
      );
    }

    const userRole = req.user.role?.key;

    if (!userRole) {
      return next(
        new AppError({
          statusCode: 403,
          userMessageKey: AUTH_ERROR_MESSAGES.USER_ROLE_INVALID,
          debugMessage: "User has no role assigned.",
          code: AUTH_ERROR_CODES.USER_ROLE_INVALID,
          debugCode: DEBUG_CODES.AUTH.USER_ROLE_MISSING,
        })
      );
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError({
          statusCode: 403,
          userMessageKey: AUTH_ERROR_MESSAGES.USER_ROLE_INVALID,
          debugMessage: `User role '${userRole}' is not allowed. Expected: [${allowedRoles.join(", ")}].`,
          code: AUTH_ERROR_CODES.USER_ROLE_INVALID,
          debugCode: DEBUG_CODES.AUTH.USER_ROLE_INVALID,
        })
      );
    }

    return next();
  };

export { requireRole };
