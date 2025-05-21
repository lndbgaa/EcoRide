import { Ride } from "@/models/mysql/index.js";
import RideService from "@/services/ride.service.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { Request, Response } from "express";

/**
 * Gère la création d'un nouveau trajet.
 */
export const createRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const data = req.body;

  const ride = await RideService.createRide(userId, data);

  res.status(201).json({
    success: true,
    message: "Trajet créé avec succès.",
    data: ride.toPublicDTO(),
  });
});

/**
 * Gère la recherche de trajets.
 */
export const searchForRides = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const data = req.body;
  const { page, limit, offset } = parsePagination(req);

  const { count, rides } = await RideService.searchForRides(data, limit, offset, userId);

  const message = count === 0 ? "Aucun trajet trouvé." : count === 1 ? "1 trajet trouvé." : `${count} trajets trouvés.`;

  const dto = rides.map((ride: Ride) => ride.toPublicDTO());

  res.status(200).json({
    success: true,
    message,
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});

/**
 * Gère la récupération des détails d'un trajet.
 */
export const getRideDetails = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const rideId = req.params.id;

  const { ride, bookings, preferences } = await RideService.getRideDetails(rideId);

  res.status(200).json({
    success: true,
    message: "Trajet récupéré avec succès.",
    data: {
      isDriver: ride.getDriverId() === userId,
      ride: ride.toPublicDTO(),
      preferences,
      bookings: bookings.map((booking) => booking.toPublicDTO()),
    },
  });
});

/**
 * Gère le début d'un trajet.
 */
export const startRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const rideId = req.params.id;

  await RideService.startRide(rideId, userId);

  res.sendStatus(204);
});

/**
 * Gère la fin d'un trajet.
 */
export const endRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const rideId = req.params.id;

  await RideService.endRide(rideId, userId);

  res.sendStatus(204);
});

/**
 * Gère l'annulation d'un trajet.
 */
export const cancelRide = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const rideId = req.params.id;

  await RideService.cancelRide(rideId, userId);

  res.sendStatus(204);
});

/**
 * Gère la récupération des trajets de l'utilisateur connecté
 */
export const getMyRides = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;

  const { page, limit, offset } = parsePagination(req);

  const { count, rides } = await RideService.getUserRides(userId, limit, offset);

  const dto = rides.map((ride: Ride) => ride.toPublicDTO());

  res.status(200).json({
    success: true,
    message: "Historique des trajets récupérés avec succès.",
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});
