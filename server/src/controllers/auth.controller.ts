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
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  const { accessToken, refreshToken, expiresIn, expiresAt } = await AuthService.register(
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

  res.status(201).json({ success: true, data: { accessToken, expiresIn, expiresAt } });
});

// 🔑 Connexion d'un compte (utilisateur, employé, administrateur)
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, expiresIn, expiresAt } = await AuthService.login(
    email,
    password
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    maxAge: ms(refresh_expiration),
  });
  res.status(200).json({ success: true, data: { accessToken, expiresIn, expiresAt } });
});

// 🔑 Déconnexion d'un compte (utilisateur, employé, administrateur)
export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(200).json({
      success: true,
      message: "Aucune session active détectée.",
    });
  }

  await AuthService.logout(refreshToken);

  // Suppression immédiate du cookie côté client
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  res.status(200).json({ success: true, message: "Déconnexion réussie. Session terminée." });
});

// 🔑 Rafraîchissement d'un jeton d'accès (utilisateur, employé, administrateur)
export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token de rafraîchissement manquant.",
    });
  }

  const { accessToken, expiresIn, expiresAt } = await AuthService.refreshAccessToken(refreshToken);

  res.status(200).json({ success: true, data: { accessToken, expiresIn, expiresAt } });
});
