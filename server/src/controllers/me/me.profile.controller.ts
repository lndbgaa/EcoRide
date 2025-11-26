import { appConfig } from "@/config";
import { COMMON_ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { UserDeletionService, UserProfileService } from "@/services";
import { AppError, catchAsync, generateRefreshTokenCookieOptions } from "@/utils";

import type { MulterRequest } from "@/@types/express";
import type { UpdateUserInfoPayload, UpdateUserPasswordPayload } from "@/types";
import type { Request, Response } from "express";

const { env, auth } = appConfig;
const { refreshExpiration } = auth;

/**
 * Retrieve the authenticated user's private information.
 */
export const getMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;
  const dto = user.toPrivateDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DATA_RETRIEVED),
    data: dto,
  });
});

/**
 * Update the authenticated user's profile information.
 */
export const updateMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;
  const data: UpdateUserInfoPayload = req.body;

  const updatedUser = await UserProfileService.updateProfile(user, data);
  const dto = updatedUser.toPrivateDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PROFILE_UPDATED),
    data: dto,
  });
});

/**
 * Update the authenticated user's password.
 */
export const updateMyPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;
  const data: UpdateUserPasswordPayload = req.body;

  await UserProfileService.updatePassword(user, data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PASSWORD_UPDATED),
  });
});

/**
 * Update the authenticated user's profile picture.
 */
export const updateMyPicture = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const user = req.user;

  const { file } = req;

  if (!file) {
    throw new AppError({
      statusCode: 400,
      userMessageKey: COMMON_ERROR_MESSAGES.UPLOAD.IMAGE.FILE_MISSING,
    });
  }

  const { url } = await UserProfileService.updatePicture(user, file);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PICTURE_UPDATED),
    data: { url },
  });
});

/**
 * Handle the authenticated user's account deletion request.
 */
export const requestMyDeletion = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;

  await UserDeletionService.requestDeletion(user);

  res.clearCookie("refreshToken", generateRefreshTokenCookieOptions(env, refreshExpiration));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DELETION_REQUESTED),
  });
});
