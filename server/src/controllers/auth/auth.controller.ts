import { appConfig } from "@/config";
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES, DEBUG_CODES, SUCCESS_MESSAGES } from "@/constants";
import { AuthService } from "@/services";
import { AppError, catchAsync, generateRefreshTokenCookieOptions } from "@/utils";

import type { LoginUserPayload, RegisterUserPayload } from "@/types";
import type { Request, Response } from "express";

const { env, auth } = appConfig;
const { refreshExpiration } = auth;

const cookieOptions = generateRefreshTokenCookieOptions(env, refreshExpiration);

/**
 * Handle user registration.
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserPayload = req.body;

  await AuthService.register(data);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.REGISTERED),
  });
});

/**
 * Handle user login.
 */
export const loginUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginUserPayload = req.body;

  const { refreshToken, accessToken } = await AuthService.login(data);

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_IN),
    data: { accessToken },
  });
});

/**
 * Handle user logout.
 */
export const logoutUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_OUT),
    });
  }

  await AuthService.logout(refreshToken);

  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_OUT),
  });
});

/**
 * Handle user token refresh.
 */
export const refreshUserToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string | undefined = req.cookies.refreshToken;

  if (!token) {
    throw new AppError({
      statusCode: 401,
      userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
      debugMessage: "Refresh token not found in cookies.",
      code: AUTH_ERROR_CODES.SESSION_INVALID,
      debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_MISSING,
    });
  }

  try {
    const { refreshToken, accessToken } = await AuthService.refreshToken(token);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.REFRESHED),
      data: { accessToken },
    });
  } catch (error) {
    res.clearCookie("refreshToken", cookieOptions);
    throw error;
  }
});
