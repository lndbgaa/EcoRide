import config from "@/config/app.config.js";
import AppError from "@/utils/AppError.js";
import { verifyToken } from "@/utils/jwt.utils.js";

import type { NextFunction, Request, Response } from "express";

/**
 * Middleware de vérification de l'authentification obligatoire
 */
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError({
        statusCode: 401,
        statusText: "Unauthorized",
        message: "Token manquant ou mal formé.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, config.jwt.accessSecret);

    req.user = decoded;

    next();
  } catch {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token invalide ou expiré.",
    });
  }
};

export default requireAuth;
