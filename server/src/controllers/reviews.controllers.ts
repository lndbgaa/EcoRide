import type { ReviewStatus } from "@/models/mysql/Review.model.js";
import type { Request, Response } from "express";

import ReviewService from "@/services/review.service.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la création d'un avis par un utilisateur.
 */
export const createReview = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    await ReviewService.createReview(userId, data);

    res.status(201).json({ success: true, message: "Avis créé avec succès." });
  }
);

/**
 * Gère la récupération des avis.
 */
export const getReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { count, reviews } = await ReviewService.getReviews(
      status as ReviewStatus,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Avis récupérés avec succès.",
      data: reviews.map((review) => review.toAdminDTO()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }
);

/**
 * Gère l'approbation d'un avis par un employé.
 */
export const approveReview = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const employeeId = req.user.id;
    const reviewId = req.params.id;

    await ReviewService.moderateReview(reviewId, employeeId, "approved");

    res
      .status(200)
      .json({ success: true, message: "Avis approuvé avec succès." });
  }
);

/**
 * Gère la réjection d'un avis par un employé.
 */
export const rejectReview = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const employeeId = req.user.id;
    const reviewId = req.params.id;

    await ReviewService.moderateReview(reviewId, employeeId, "rejected");

    res
      .status(200)
      .json({ success: true, message: "Avis rejeté avec succès." });
  }
);
