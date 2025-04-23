import type { NextFunction, Request, Response } from "express";

import AppError from "@/utils/AppError.js";

/**
 * Middleware de vérification du rôle de l'utilisateur (autorisation)
 */
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role ?? "user")) {
      return next(
        new AppError({
          statusCode: 403,
          statusText: "Forbidden",
          message: "Accès refusé",
        })
      );
    }

    next();
  };
};

export default requireRole;
