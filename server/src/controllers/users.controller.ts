import { REVIEW_STATUSES, SUCCESS_MESSAGES } from "@/constants";
import { PreferenceService, ReviewService, UserService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetReviewsFilters, GetReviewsSortOptions } from "@/types";
import type { Request, Response } from "express";

const { APPROVED } = REVIEW_STATUSES;

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
  const preferences = await PreferenceService.getUserPreferences(user);
  const dto = preferences.map((p) => p.toDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.PREFERENCE.RETRIEVED_ALL),
    data: dto,
  });
});

/**
 * Retrieve the public reviews received by a user, with pagination.
 */
export const getUserReceivedReviews = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;

  const filters: GetReviewsFilters = {
    status: APPROVED,
    targetId: userId,
  };

  const sortOptions: GetReviewsSortOptions = {
    by: "createdAt",
    dir: "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, reviews } = await ReviewService.findAll(limit, offset, filters, sortOptions, {
    include: [{ association: "author" }],
  });

  const totalPages = Math.ceil(count / limit);
  const dto = reviews.map((r) => r.toPublicDTO());

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REVIEW.RETRIEVED_ALL),
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages && totalPages > 0,
      hasPrevPage: page > 1,
    },
  });
});
