import ms from "ms";

import type { Request, Response } from "express";

import config from "@/config/app.config.js";
import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import User from "@/models/mysql/User.model.js";
import AuthService from "@/services/auth.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

const { env } = config.server;
const { refresh_expiration } = config.jwt;

// 🔑 Création d'un compte (utilisateur)
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const { accessToken, refreshToken } = await AuthService.register(
    User,
    ACCOUNT_ROLES_LABEL.USER,
    data
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    maxAge: ms(refresh_expiration),
  });

  return res.status(201).json({ success: true, accessToken });
});

// 🔑 Connexion d'un compte (utilisateur, employé, administrateur)
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await AuthService.login(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    maxAge: ms(refresh_expiration),
  });
  res.status(200).json({ success: true, accessToken });
});

// 🔑 Déconnexion d'un compte (utilisateur, employé, administrateur)
export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token de rafraîchissement manquant.",
    });
  }

  await AuthService.logout(refreshToken);

  res.clearCookie("refreshToken");

  res.status(200).json({ success: true });
});

// 🔑 Rafraîchissement d'un jeton d'accès (utilisateur, employé, administrateur)
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token de rafraîchissement manquant.",
    });
  }

  const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

  res.status(200).json({ success: true, accessToken });
});
