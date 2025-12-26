import { REVIEW_STATUSES, SUCCESS_MESSAGES } from "@/constants";
import { ReviewService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetMyReviewsQuery, GetReviewsFilters, GetReviewsSortOptions } from "@/types";
import type { Request, Response } from "express";

const { APPROVED } = REVIEW_STATUSES;

/**
 * Retrieve all approved reviews received by the authenticated user with paginated results.
 * Supports optional sorting by creation date or rating.
 */
export const getMyReceivedReviews = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const { sortBy, sortDir }: GetMyReviewsQuery = req.query;

  const filters: GetReviewsFilters = {
    status: APPROVED,
    targetId: user.id,
  };

  const sortOptions: GetReviewsSortOptions = {
    by: sortBy ?? "createdAt",
    dir: sortDir ?? "desc",
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

/**
 * Retrieve all approved reviews written by the authenticated user with paginated results.
 * Supports optional sorting by creation date or rating.
 */
export const getMyWrittenReviews = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const { sortBy, sortDir }: GetMyReviewsQuery = req.query;

  const filters: GetReviewsFilters = {
    status: APPROVED,
    authorId: user.id,
  };

  const sortOptions: GetReviewsSortOptions = {
    by: sortBy ?? "createdAt",
    dir: sortDir ?? "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, reviews } = await ReviewService.findAll(limit, offset, filters, sortOptions, {
    include: [{ association: "target" }],
  });

  const totalPages = Math.ceil(count / limit);
  const dto = reviews.map((r) => r.toAuthorDTO());

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
