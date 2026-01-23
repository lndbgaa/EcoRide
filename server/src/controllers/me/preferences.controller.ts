import { SUCCESS_MESSAGES } from "@/constants";
import { PreferenceService } from "@/services";
import { catchAsync } from "@/utils";

import type { PreferenceCategoryKey } from "@/types";
import type { Request, Response } from "express";

/**
 * Retrieve the authenticated user's preferences.
 */
export const getMyPreferences = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const preferences = await PreferenceService.getUserPreferences(user);
  const dto = preferences.map((p) => p.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.PREFERENCE.RETRIEVED_ALL),
    data: dto,
  });
});

/**
 * Update the authenticated user's preference for a given category.
 */
export const updateMyPreference = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const categoryKey = req.params.categoryKey as PreferenceCategoryKey;
  const optionKey: string = req.body.optionKey;

  const preference = await PreferenceService.updateUserPreferenceForCategory(user, categoryKey, optionKey);
  const dto = preference.toDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.PREFERENCE.UPDATED),
    data: dto,
  });
});
