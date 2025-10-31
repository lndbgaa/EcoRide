import { appConfig } from "@/config";
import { AUTH_ERROR_CODES } from "@/constants";
import { validateJwt } from "@/utils";

import type { NextFunction, Request, Response } from "express";

const { auth } = appConfig;
const { accessSecret } = auth;

const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.substring(7);

  if (!token) return next();

  try {
    const decoded = validateJwt(token, accessSecret);
    req.user = decoded;

    return next();
  } catch (err: any) {
    if (err.code === AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED) {
      return next(err);
    }

    req.user = undefined;
    return next();
  }
};

export { optionalAuth };
