import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES, DEBUG_CODES } from "@/constants";
import { AppError } from "@/utils";

import type { NextFunction, Request, Response } from "express";

const requireRole =
  (allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(
        new AppError({
          statusCode: 403,
          userMessageKey: AUTH_ERROR_MESSAGES.ROLE_INVALID,
          debugMessage: `User role "${userRole}" is not allowed. Expected: [${allowedRoles.join(", ")}].`,
          code: AUTH_ERROR_CODES.ROLE_INVALID,
          debugCode: DEBUG_CODES.AUTH.ROLE_INVALID,
        })
      );
    }

    return next();
  };

export { requireRole };
