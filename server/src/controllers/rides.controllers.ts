import type { Request, Response } from "express";

import { Ride } from "@/models/mysql";
import BookingService from "@/services/booking.service.js";
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
    .status(200)
    .json({ success: true, message: "Trajet créé avec succès.", data: ride.toPrivateDTO() });
});

/**
 * Gère la recherche de trajets.
 */
export const searchForRides = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;

  const rides: Ride[] = await RideService.searchForRides(userId, data);

  const message =
    rides.length === 0
      ? "Aucun trajet trouvé."
      : rides.length === 1
      ? "1 trajet trouvé."
      : `${rides.length} trajet(s) trouvé(s).`;

  res.status(200).json({
    success: true,
    message,
    data: rides.map((ride) => ride.toPublicDTO()),
  });
});

/**
 * Gère la récupération des détails d'un trajet.
 */
export const getRideDetails = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  const ride: Ride = await RideService.getRideDetails(rideId);

  res
    .status(200)
    .json({ success: true, message: "Trajet récupéré avec succès.", data: ride.toPublicDTO() });
});

/**
 * Gère le début d'un trajet.
 */
export const startRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  await RideService.changeRideStatus(rideId, "in_progress");

  res.status(200).json({ success: true, message: "Trajet commencé avec succès." });
});

/**
 * Gère la fin d'un trajet.
 */
export const endRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  await RideService.changeRideStatus(rideId, "completed");

  res.status(200).json({ success: true, message: "Trajet terminé avec succès." });
});

/**
 * Gère l'annulation d'un trajet.
 */
export const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  await RideService.changeRideStatus(rideId, "cancelled");

  res.status(200).json({ success: true, message: "Trajet annulé avec succès." });
});

/**
 * Gère la réservation d'un trajet.
 */
export const bookRide = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { rideId } = req.params;

  await BookingService.createBooking(userId, rideId);

  res.status(200).json({ success: true, message: "Trajet réservé avec succès." });
});
