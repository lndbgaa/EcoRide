import { appConfig } from "@/config";
import { COMMON_ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { UserDeletionService, UserProfileService, UserService } from "@/services";
import { AppError, catchAsync, generateRefreshTokenCookieOptions } from "@/utils";

import type { MulterRequest } from "@/@types/express";
import type { CancelUserDeletionPayload, UpdateUserInfoPayload, UpdateUserPasswordPayload } from "@/types";
import type { Request, Response } from "express";

const { env, auth } = appConfig;
const { refreshExpiration } = auth;

/**
 * Retrieve the authenticated user's private information.
 */
export const getMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const user = await UserService.findById(userId, 500);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PERSONAL_DATA_RETRIEVED),
    data: user.toPrivateDTO(),
  });
});

/**
 * Update the authenticated user's profile information.
 */
export const updateMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: UpdateUserInfoPayload = req.body;

  const user = await UserProfileService.updateProfile(userId, data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PROFILE_UPDATED),
    data: user.toPrivateDTO(),
  });
});

/**
 * Update the authenticated user's password.
 */
export const updateMyPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: UpdateUserPasswordPayload = req.body;

  await UserProfileService.updatePassword(userId, data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PASSWORD_UPDATED),
  });
});

/**
 * Update the authenticated user's profile picture.
 */
export const updateMyPicture = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const { file } = req;

  if (!file) {
    throw new AppError({
      statusCode: 400,
      userMessageKey: COMMON_ERROR_MESSAGES.UPLOAD.IMAGE.FILE_MISSING,
    });
  }

  const { url } = await UserProfileService.updatePicture(userId, file);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PICTURE_UPDATED),
    data: { url },
  });
});

/**
 * Handle the authenticated user's account deletion request.
 */
export const requestAccountDeletion = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  await UserDeletionService.requestDeletion(userId);

  res.clearCookie("refreshToken", generateRefreshTokenCookieOptions(env, refreshExpiration));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DELETION_REQUESTED),
  });
});

/**
 * Handle the authenticated user's deletion request cancellation.
 */
export const cancelDeletionRequest = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CancelUserDeletionPayload = req.body;

  await UserDeletionService.cancelDeletion(data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DELETION_CANCELLED),
  });
});
