import { SUCCESS_MESSAGES } from "@/constants";
import { BookingService } from "@/services";
import { catchAsync } from "@/utils";

import type { CreateBookingPayload } from "@/types";
import type { Request, Response } from "express";

/**
 * Create a booking for the authenticated user.
 */
export const createBooking = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;
  const data: CreateBookingPayload = req.body;

  const booking = await BookingService.create(user, data);
  const dto = booking.toPassengerDTO(req.t);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.BOOKING.CREATED),
    data: dto,
  });
});

/**
 * Cancels an existing booking for the authenticated user.
 */
export const cancelBooking = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;
  const bookingId = req.params.id!;

  const booking = await BookingService.cancel(userId, bookingId);
  const dto = booking.toPassengerDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.BOOKING.CANCELLED),
    data: dto,
  });
});
