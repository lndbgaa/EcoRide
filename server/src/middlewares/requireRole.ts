import AppError from "@/utils/AppError.js";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware pour vérifier si l'utilisateur connecté est dans un des rôles spécifiés
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
