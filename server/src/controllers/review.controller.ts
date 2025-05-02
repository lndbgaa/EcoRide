import ReviewService from "@/services/review.service.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { Request, Response } from "express";

/**
 * Gère la création d'un avis par l'utilisateur connecté.
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
 * Gère la récupération des avis reçus par un utilisateur
 */
export const getUserReceivedReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    const { page, limit, offset } = parsePagination(req);

    const { count, reviews } = await ReviewService.getUserReceivedReviews(
      userId,
      limit,
      offset
    );

    const dto = reviews.map((review) => review.toPublicDTO());

    res.status(200).json({
      success: true,
      message: "Avis récupérés avec succès.",
      data: dto,
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
 * Gère la récupération de l'historique des avis reçus par l'utilisateur connecté
 */
export const getMyReceivedReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const { page, limit, offset } = parsePagination(req);

    const { count, reviews } = await ReviewService.getUserReceivedReviews(
      userId,
      limit,
      offset
    );

    const dto = reviews.map((review) => review.toPublicDTO());

    res.status(200).json({
      success: true,
      message: "Historique des avis reçus récupéré avec succès.",
      data: dto,
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
 * Gère la récupération de l'historique des avis écrits par l'utilisateur connecté
 */
export const getMyWrittenReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const { page, limit, offset } = parsePagination(req);

    const { count, reviews } = await ReviewService.getUserWrittenReviews(
      userId,
      limit,
      offset
    );

    const dto = reviews.map((review) => review.toAuthorDTO());

    res.status(200).json({
      success: true,
      message: "Historique des avis écrits récupéré avec succès.",
      data: dto,
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
 * Gère la récupération des avis en attente de validation par un employé.
 */
export const getPendingReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { page, limit, offset } = parsePagination(req);

    const { count, reviews } = await ReviewService.getReviewsByStatus(
      "pending",
      limit,
      offset
    );

    const dto = reviews.map((review) => review.toEmployeeDTO());

    res.status(200).json({
      success: true,
      message: "Avis en attente de validation récupérés avec succès.",
      data: dto,
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

    res.sendStatus(204);
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

    res.sendStatus(204);
  }
);
