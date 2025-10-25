import { SUCCESS_MESSAGES } from "@/constants";
import { catchAsync } from "@/utils";

import { AuthService, EmailVerificationService } from "@/services";

import type { RegisterUserPayload } from "@/types";
import type { Request, Response } from "express";

export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserPayload = req.body;

  await AuthService.registerUser(data);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.USER_REGISTERED),
  });
});

export const verifyUserEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await EmailVerificationService.verifyEmail(token);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFIED),
  });
});

export const resendUserVerificationEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const email: string = req.body.email;

  await EmailVerificationService.sendVerificationLinkByEmail(email);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.AUTH.EMAIL_VERIFICATION_SENT),
  });
});
