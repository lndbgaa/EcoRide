import StatisticsService from "@/services/statistics.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

/**
 * Gère la récupération du nombre total de crédits générés par la plateforme
 */
export const getPlatformTotalCredits = catchAsync(async (req: Request, res: Response) => {
  const totalCredits = await StatisticsService.getTotalCredits();

  res.status(200).json({ success: true, data: { totalCredits } });
});

/**
 * Gère la récupération des crédits générés par la plateforme par jour
 */
export const getPlatformDailyCredits = async (req: Request, res: Response) => {
  const total = await StatisticsService.getDailyCredits();

  res.status(200).json({ success: true, data: total });
};

/**
 * Gère la récupération du nombre de trajets prévus par jour
 */
export const getPlatformDailyRides = async (req: Request, res: Response) => {
  const total = await StatisticsService.getDailyRides();

  res.status(200).json({ success: true, data: total });
};
