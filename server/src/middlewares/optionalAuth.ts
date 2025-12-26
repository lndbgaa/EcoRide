import { appConfig } from "@/config";
import { AUTH_ERROR_CODES } from "@/constants";
import { UserService } from "@/services";
import { validateJwt } from "@/utils";

import type { NextFunction, Request, Response } from "express";

const { auth } = appConfig;
const { accessSecret } = auth;

const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.substring(7);

  if (!token) return next();

  try {
    const decoded = validateJwt(token, accessSecret);

    const user = await UserService.findById(decoded.id, {
      include: [{ association: "role" }],
    });

    req.user = user;

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
