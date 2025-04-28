import type { Request, Response } from "express";

import ReviewService from "@/services/review.service.js";

/**
 * Gère l'approbation d'un avis par un employé.
 */
export const approveReview = async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const { reviewId } = req.params;

  await ReviewService.moderateReview(reviewId, employeeId, "approved");

  res.status(200).json({ message: "Avis approuvé avec succès." });
};

/**
 * Gère la réjection d'un avis par un employé.
 */
export const rejectReview = async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const { reviewId } = req.params;

  await ReviewService.moderateReview(reviewId, employeeId, "rejected");

  res.status(200).json({ message: "Avis rejeté avec succès." });
};
