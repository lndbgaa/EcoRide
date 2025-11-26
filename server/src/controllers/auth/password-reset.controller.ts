import { SUCCESS_MESSAGES } from "@/constants";
import { PasswordResetService } from "@/services";
import { catchAsync } from "@/utils";

import type { ResetPasswordPayload } from "@/types";
import type { Request, Response } from "express";

/**
 * Handle password reset request.
 */
export const requestUserPasswordReset = catchAsync(async (req: Request, res: Response): Promise<Response> => {
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
export const verifyUserPasswordResetToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
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
export const resetUserPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: ResetPasswordPayload = req.body;

  await PasswordResetService.resetPassword(data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_COMPLETED),
  });
});
