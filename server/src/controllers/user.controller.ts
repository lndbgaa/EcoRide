import { COMMON_ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { UserProfileService, UserService } from "@/services";
import { AppError, catchAsync } from "@/utils";

import type { MulterRequest } from "@/@types/express";
import type { UpdateUserInfoPayload, UpdateUserPasswordPayload } from "@/types";
import type { Response } from "express";

/**
 * Handle the authenticated user's private information retrieve.
 */
export const getMyInfo = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const user = await UserService.findById(userId, 500);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PERSONAL_DATA_RETRIEVED),
    data: user.toPrivateDTO(),
  });
});

/**
 * Handle the authenticated user's profile information update.
 */
export const updateMyInfo = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
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
 * Handle the authenticated user's password update.
 */
export const updateMyPassword = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: UpdateUserPasswordPayload = req.body;

  await UserProfileService.updatePassword(userId, data);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.PASSWORD_UPDATED),
  });
});

/**
 * Handle the authenticated user's profile picture update.
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
