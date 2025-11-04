import { appConfig } from "@/config";
import { DEBUG_CODES, SUCCESS_MESSAGES } from "@/constants";
import { AuthService, EmailVerificationService, PasswordResetService } from "@/services";
import { AppError, catchAsync, generateRefreshTokenCookieOptions } from "@/utils";

import { AUTH_ERROR_MESSAGES } from "@/constants/errors";
import type { LoginUserPayload, RegisterUserPayload, ResetPasswordPayload } from "@/types";
import type { Request, Response } from "express";

const { env, auth } = appConfig;
const { refreshExpiration } = auth;

/**
 * Handle user registration.
 */
export const register = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserPayload = req.body;

  await AuthService.registerUser(data);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.REGISTERED),
  });
});

/**
 * Handle user login.
 */
export const login = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginUserPayload = req.body;

  const { refreshToken, accessToken } = await AuthService.loginUser(data);

  res.cookie("refreshToken", refreshToken, generateRefreshTokenCookieOptions(env, refreshExpiration));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_IN),
    data: { accessToken },
  });
});

/**
 * Handle user logout.
 */
export const logout = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_OUT),
    });
  }

  await AuthService.logoutUser(refreshToken);

  res.clearCookie("refreshToken", generateRefreshTokenCookieOptions(env, refreshExpiration));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.LOGGED_OUT),
  });
});

/**
 * Handle user token refresh.
 */
export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string | undefined = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError({
      statusCode: 401,
      userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
      debugMessage: "Refresh token not found in cookies",
      code: AUTH_ERROR_MESSAGES.SESSION_INVALID,
      debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_MISSING,
    });
  }

  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await AuthService.refreshUserToken(
      refreshToken
    );

    res.cookie("refreshToken", newRefreshToken, generateRefreshTokenCookieOptions(env, refreshExpiration));

    return res.status(200).json({
      success: true,
      message: req.t(SUCCESS_MESSAGES.AUTH.REFRESHED),
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    res.clearCookie("refreshToken", generateRefreshTokenCookieOptions(env, refreshExpiration));
    throw error;
  }
});

/**
 * Handle resending user email verification.
 */
export const resendEmailVerificationLink = catchAsync(
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
 * Handle user email verification.
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await EmailVerificationService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFIED),
  });
});

/**
 * Handle password reset request.
 */
export const requestPasswordReset = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const email: string = req.body.email;

  await PasswordResetService.sendPasswordResetLinkByEmail(email);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_SENT),
  });
});

/**
 * Handle password reset token verification.
 */
export const verifyPasswordResetToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await PasswordResetService.verifyResetToken(token);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_TOKEN_VALID),
  });
});

/**
 * Handle password reset.
 */
export const resetPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: ResetPasswordPayload = req.body;

  await PasswordResetService.resetPassword(data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_COMPLETED),
  });
});
