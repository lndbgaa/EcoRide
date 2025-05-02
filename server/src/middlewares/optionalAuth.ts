import type { NextFunction, Request, Response } from "express";

import config from "@/config/app.config.js";
import { verifyToken } from "@/utils/jwt.js";

const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyToken(token, config.jwt.access_secret);

  req.user = payload;

  next();
};

export default optionalAuth;
