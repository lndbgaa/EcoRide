import ms from "ms";

import config from "@/config/app.config.js";
import AuthService from "@/services/auth.service.js";
import PreferenceService from "@/services/preference.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

import type {
  LoginDTO,
  LoginResult,
  RefreshAccessTokenResult,
  RegisterEmployeeDTO,
  RegisterUserDTO,
  RegisterUserResult,
} from "@/types/auth.types.js";
import type { Request, Response } from "express";

const { env } = config;
const { refreshExpiration } = config.jwt;

/**
 * Gère la création d'un compte (utilisateur).
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserDTO = req.body;

  const { accountId, accessToken, refreshToken }: RegisterUserResult = await AuthService.registerUser(data);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ms(refreshExpiration),
  });

  await PreferenceService.defineDefaultPreferences(accountId);

  return res.status(201).json({
    success: true,
    message: "Compte utilisateur créé avec succès.",
    data: { accessToken },
  });
});

/**
 * Gère la création d'un compte (employé).
 */
export const registerEmployee = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterEmployeeDTO = req.body;

  await AuthService.registerEmployee(data);

  return res.status(201).json({ success: true, message: "Compte employé créé avec succès." });
});

/**
 * Gère la connexion d'un compte (utilisateur, employé, administrateur).
 */
export const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginDTO = req.body;

  const { accessToken, refreshToken }: LoginResult = await AuthService.login(data);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ms(refreshExpiration),
  });

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",
    data: { accessToken },
  });
});

/**
 * Gère la déconnexion d'un compte (utilisateur, employé, administrateur).
 */
export const logout = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: "Aucune session active détectée.",
    });
  }

  await AuthService.logout(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.sendStatus(204);
});

/**
 * Gère le rafraîchissement d'un jeton d'accès (utilisateur, employé, administrateur).
 */
export const handleTokenRefresh = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Aucune session active détectée.",
      });
    }

    const { accessToken, newRefreshToken }: RefreshAccessTokenResult = await AuthService.refreshAccessToken(
      refreshToken
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ms(refreshExpiration),
    });

    return res.status(200).json({
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
