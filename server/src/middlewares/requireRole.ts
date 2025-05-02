import AppError from "@/utils/AppError.js";

import type { NextFunction, Request, Response } from "express";

/**
 * Fonction de vérification du rôle de l'utilisateur
 * @param allowedRoles - Les rôles autorisés
 * @returns Middleware Express
 */
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role ?? "user";

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError({
          statusCode: 403,
          statusText: "Forbidden",
          message: "Vous n'êtes pas autorisé à accéder à cette ressource.",
        })
      );
    }

    next();
  };
};

export default requireRole;
