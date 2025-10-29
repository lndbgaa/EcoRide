import { DEBUG_CODES, ERROR_CODES, ERROR_MESSAGES } from "@/constants";
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
          userMessage: ERROR_MESSAGES.AUTH.ROLE_INVALID,
          debugMessage: `User role "${userRole}" is not allowed. Expected: [${allowedRoles.join(", ")}].`,
          code: ERROR_CODES.AUTH.ROLE_INVALID,
          debugCode: DEBUG_CODES.AUTH.ROLE_INVALID,
        })
      );
    }

    return next();
  };

export { requireRole };
