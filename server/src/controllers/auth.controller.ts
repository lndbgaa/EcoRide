import ms from "ms";

import { appConfig } from "@/config";
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { AuthService, EmailVerificationService } from "@/services";
import { AppError, catchAsync } from "@/utils";

import type { LoginUserPayload, RegisterUserPayload } from "@/types";
import type { CookieOptions, Request, Response } from "express";

const { env, auth } = appConfig;
const { refreshExpiration } = auth;

function generateCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env === "production",
    sameSite: env === "production" ? "none" : "lax",
    path: "/",
    maxAge: ms(refreshExpiration),
  };
}

/**
 * Handles user registration.
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserPayload = req.body;

  await AuthService.registerUser(data);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.REGISTRATION_SUCCESS),
  });
});

/**
 * Handles user email verification.
 */
export const verifyUserEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await EmailVerificationService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFICATION_SUCCESS),
  });
});

/**
 * Handles resending user email verification.
 */
export const resendUserVerificationEmail = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const email: string = req.body.email;

    await EmailVerificationService.sendVerificationLinkByEmail(email);

    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFICATION_SENT),
    });
  }
);

/**
 * Handles user login.
 */
export const loginUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginUserPayload = req.body;

  const { refreshToken, accessToken } = await AuthService.loginUser(data);

  res.cookie("refreshToken", refreshToken, generateCookieOptions());

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS),
    data: { accessToken },
  });
});

/**
 * Handles user tokens refresh.
 */
export const refreshUserTokens = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError({
      statusCode: 401,
      userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
      debugMessage: "Refresh token not found in cookies",
      code: ERROR_CODES.AUTH.SESSION_INVALID,
    });
  }

  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await AuthService.refreshUserTokens(refreshToken);

    res.cookie("refreshToken", newRefreshToken, generateCookieOptions());

    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.REFRESH_SUCCESS),
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    res.clearCookie("refreshToken", generateCookieOptions());
    throw error;
  }
});

/**
 * Handles user logout.
 */
export const logoutUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS),
    });
  }

  await AuthService.logoutUser(refreshToken);

  res.clearCookie("refreshToken", generateCookieOptions());

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS),
  });
});
