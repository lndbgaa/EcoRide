import config from "@/config/app.config.js";
import { verifyToken } from "@/utils/jwt.utils.js";

import type { NextFunction, Request, Response } from "express";

/**
 * Middleware de vérification de l'authentification optionnelle
 */
const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token, config.jwt.access_secret);

  req.user = decoded;

  next();
};

export default optionalAuth;
