import { SUCCESS_MESSAGES } from "@/constants";
import { PreferenceService, UserService } from "@/services";
import { catchAsync } from "@/utils";

import type { Request, Response } from "express";

/**
 * Retrieve public information about a user by their ID.
 */
export const getUserInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;

  const user = await UserService.findById(userId);
  const dto = user.toPublicDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.DATA_RETRIEVED),
    data: dto,
  });
});

/**
 * Retrieve the public preferences of a user by their ID.
 */
export const getUserPreferences = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;

  const user = await UserService.findById(userId);
  const preferences = await PreferenceService.getUserPreferences(user.id);
  const dto = preferences.map((p) => p.toPublicDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.PREFERENCE.RETRIEVED_ALL),
    data: dto,
  });
});
