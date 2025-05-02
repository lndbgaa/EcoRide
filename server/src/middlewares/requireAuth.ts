import config from "@/config/app.config.js";
import AppError from "@/utils/AppError.js";
import { verifyToken } from "@/utils/jwt.utils.js";

import type { NextFunction, Request, Response } from "express";

/**
 * Middleware de vérification de l'authentification obligatoire
 */
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token manquant ou mal formé",
    });
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyToken(token, config.jwt.access_secret);

  req.user = payload;

  next();
};

export default requireAuth;
