import { Booking } from "@/models/mysql/index.js";
import BookingService from "@/services/booking.service.js";
import IncidentService from "@/services/incident.service.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { Request, Response } from "express";

/**
 * Gère la création d'une réservation.
 */
export const createBooking = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { rideId, seats } = req.body;

  await BookingService.createBooking(userId, rideId, seats);

  res.status(201).json({ success: true, message: "Réservation créée." });
});

/**
 * Gère l'annulation d'une réservation.
 */
export const cancelBooking = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const bookingId = req.params.id;

  const booking = await BookingService.findOwnedBookingOrThrow(userId, bookingId);

  await BookingService.cancelBooking(userId, booking);

  res.status(200).json({ success: true, message: "Réservation annulée." });
});

/**
 * Gère la récupération des réservations de l'utilisateur connecté
 */
export const getMyBookings = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;

  const { page, limit, offset } = parsePagination(req);

  const { count, bookings } = await BookingService.getUserBookings(userId, limit, offset);

  const message =
    count === 0
      ? "Aucune réservation trouvée."
      : count === 1
      ? "1 réservation trouvée."
      : `${count} réservations trouvées.`;

  const dto = bookings.map((booking: Booking) => booking.toPublicDTO());

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
 * Gère la validation d'une réservation dont le trajet s'est bien déroulé.
 */
export const validateBooking = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const bookingId = req.params.id;

  const booking = await BookingService.findOwnedBookingOrThrow(userId, bookingId);

  await BookingService.confirmSuccessfulBooking(booking);

  res.status(200).json({ success: true, message: "Réservation validée." });
});

/**
 * Gère la validation d'une réservation dont le trajet s'est mal déroulé.
 */
export const reportIncidentAndValidateBooking = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user.id;
  const bookingId = req.params.id;
  const { description } = req.body;

  const booking = await BookingService.findOwnedBookingOrThrow(userId, bookingId);

  await IncidentService.createIncident(userId, booking, description);

  await BookingService.confirmBookingWithIncident(booking);

  res.status(200).json({ success: true, message: "Réservation validée." });
});
