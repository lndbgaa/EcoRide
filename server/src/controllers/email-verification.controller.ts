import { SUCCESS_MESSAGES } from "@/constants";
import { EmailVerificationService } from "@/services";
import { catchAsync } from "@/utils";

import type { Request, Response } from "express";

/**
 * Handle resending user email verification.
 */
export const resendEmailVerification = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const email: string = req.body.email;

  await EmailVerificationService.sendVerificationLinkByEmail(email);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFICATION_SENT),
  });
});

/**
 * Handle user email verification.
 */
export const verifyUserEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await EmailVerificationService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFIED),
  });
});
