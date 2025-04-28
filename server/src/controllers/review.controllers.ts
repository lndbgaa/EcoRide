import ReviewService from "@/services/review.service.js";
import catchAsync from "@/utils/catchAsync.js";
import type { Request, Response } from "express";

export const createReview = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const data = req.body;

  const review = await ReviewService.createReview(userId, data);

  res.status(201).json({ success: true, message: "Avis créé avec succès.", data: review });
});
