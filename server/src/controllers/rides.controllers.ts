import type { Request, Response } from "express";

import { Ride } from "@/models/mysql";
import RideService from "@/services/ride.service.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la création d'un nouveau trajet.
 */
export const createRide = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;

  const ride: Ride = await RideService.createRide(userId, data);

  res
    .status(201)
    .json({ success: true, message: "Trajet créé avec succès.", data: ride.toPrivateDTO() });
});

/**
 * Gère la recherche de trajets.
 */
export const searchForRides = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const data = req.body;

  const rides: Ride[] = await RideService.searchForRides(data, userId);

  const message =
    rides.length === 0
      ? "Aucun trajet trouvé."
      : rides.length === 1
      ? "1 trajet trouvé."
      : `${rides.length} trajet(s) trouvé(s).`;

  res.status(200).json({
    success: true,
    message,
    data: rides.map((ride) => ride.toPreviewDTO()),
  });
});

/**
 * Gère la récupération des détails d'un trajet.
 */
export const getRideDetails = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { rideId } = req.params;

  const ride: Ride = await RideService.getRideDetails(rideId);

  res
    .status(200)
    .json({ success: true, message: "Trajet récupéré avec succès.", data: ride.toDetailedDTO() });
});

/**
 * Gère le début d'un trajet.
 */
export const startRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { rideId } = req.params;

  await RideService.startRide(rideId, userId);

  res.status(200).json({ success: true, message: "Trajet démarré avec succès." });
});

/**
 * Gère la fin d'un trajet.
 */
export const endRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { rideId } = req.params;

  await RideService.endRide(rideId, userId);

  res.status(200).json({ success: true, message: "Trajet terminé avec succès." });
});

/**
 * Gère l'annulation d'un trajet.
 */
export const cancelRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { rideId } = req.params;

  await RideService.cancelRide(rideId, userId);

  res.status(200).json({ success: true, message: "Trajet annulé avec succès." });
});
