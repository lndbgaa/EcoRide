import ms from "ms";

import type { Request, Response } from "express";

import config from "@/config/app.config.js";
import AuthService from "@/services/auth.service.js";
import PreferenceService from "@/services/preference.service.js";
import AppError from "@/utils/AppError";
import catchAsync from "@/utils/catchAsync.js";

const { env } = config;
const { refresh_expiration } = config.jwt;

/**
 * Gère la création d'un compte (utilisateur).
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  const { accountId, accessToken, refreshToken } = await AuthService.registerUser(data);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ms(refresh_expiration),
  });

  await PreferenceService.defineDefaultPreferences(accountId);

  res.status(201).json({
    success: true,
    message: "Compte utilisateur créé avec succès.",
    data: { accessToken },
  });
});

/**
 * Gère la création d'un compte employé.
 */
export const registerEmployee = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  await AuthService.registerEmployee(data);

  res.status(201).json({ success: true, message: "Compte employé créé avec succès." });
});

/**
 * Gère la connexion d'un compte (utilisateur, employé, administrateur).
 */
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await AuthService.login({
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ms(refresh_expiration),
  });

  res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data: { accessToken },
  });
});

/**
 * Gère la déconnexion d'un compte (utilisateur, employé, administrateur).
 */
export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(200).json({
      success: true,
      message: "Aucune session active détectée.",
    });
    return;
  }

  await AuthService.logout(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ success: true, message: "Déconnexion réussie." });
});

/**
 * Gère le rafraîchissement d'un jeton d'accès (utilisateur, employé, administrateur).
 */
export const handleTokenRefresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(200).json({
        success: true,
        message: "Aucune session active détectée.",
      });
      return;
    }

    const { accessToken, newRefreshToken } = await AuthService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ms(refresh_expiration),
    });

    res.status(200).json({
      success: true,
      message: "Token d'accès rafraîchi avec succès.",
      data: { accessToken },
    });
  } catch (error) {
    if (
      error instanceof AppError &&
      (error.message === "Token de rafraîchissement invalide." || error.message === "Token de rafraîchissement expiré.")
    ) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    throw error;
  }
});
