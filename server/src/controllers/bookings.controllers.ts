import type { Request, Response } from "express";

import BookingService from "@/services/booking.service.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la création d'une réservation.
 */
export const createBooking = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { rideId, seats } = req.body;

    await BookingService.createBooking(userId, rideId, seats);

    res
      .status(201)
      .json({ success: true, message: "Réservation créée avec succès." });
  }
);

/**
 * Gère l'annulation d'une réservation.
 */
export const cancelBooking = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { bookingId } = req.params;

    await BookingService.cancelBooking(userId, bookingId);

    res
      .status(200)
      .json({ success: true, message: "Réservation annulée avec succès." });
  }
);
