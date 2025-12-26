import { REVIEW_STATUSES, SUCCESS_MESSAGES } from "@/constants";
import { ReviewService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { CreateReviewPayload, GetReviewsFilters } from "@/types";
import type { Request, Response } from "express";

const { PENDING, APPROVED, REJECTED } = REVIEW_STATUSES;

/**
 * Retrieve all pending reviews with paginated results.
 */
export const getPendingReviews = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const filters: GetReviewsFilters = { status: PENDING };

  const { page, limit, offset } = parsePagination(req);

  const { count, reviews } = await ReviewService.findAll(limit, offset, filters);

  const totalPages = Math.ceil(count / limit);
  const dto = reviews.map((i) => i.toAdminDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(""),
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
 * Create a review for the authenticated user.
 */
export const createReview = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const data: CreateReviewPayload = req.body;

  await ReviewService.create(user, data);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REVIEW.CREATED),
  });
});

/**
 * Approve a pending review.
 */
export const approveReview = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const moderator = req.user!;
  const reviewId = req.params.id!;

  await ReviewService.moderate(reviewId, moderator, APPROVED);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REVIEW.APPROVED),
  });
});

/**
 * Reject a pending review.
 */
export const rejectReview = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const moderator = req.user!;
  const reviewId = req.params.id!;

  await ReviewService.moderate(reviewId, moderator, REJECTED);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.REVIEW.REJECTED),
  });
});
