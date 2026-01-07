import { BOOKING_STATUSES, SUCCESS_MESSAGES, TRIP_STATUSES } from "@/constants";
import { BookingService, TripService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetBookingsFilters, GetBookingsSortOptions, GetTripsFilters, GetTripsSortOptions } from "@/types";
import type { Request, Response } from "express";

/**
 * Retrieve paginated trips for the authenticated driver with status COMPLETED or CANCELLED.
 */
export const getMyTripsHistory = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const { COMPLETED, CANCELLED } = TRIP_STATUSES;

  const filters: GetTripsFilters = {
    status: [COMPLETED, CANCELLED],
    driverId: user.id,
  };

  const sortOptions: GetTripsSortOptions = {
    by: "departureDate",
    dir: "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, trips } = await TripService.findAll(limit, offset, filters, sortOptions);

  const totalPages = Math.ceil(count / limit);
  const dto = trips.map((t) => t.toDriverDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.RETRIEVED_ALL),
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages && totalPages > 0,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * Retrieve paginated bookings for the authenticated passenger with statuses AWAITING_FEEDBACK, COMPLETED, or CANCELLED, including related trip data.
 */
export const getMyBookingsHistory = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const { AWAITING_FEEDBACK, COMPLETED, CANCELLED } = BOOKING_STATUSES;

  const filters: GetBookingsFilters = {
    status: [AWAITING_FEEDBACK, COMPLETED, CANCELLED],
    passengerId: user.id,
  };

  const sortOptions: GetBookingsSortOptions = {
    by: "departureDate",
    dir: "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, bookings } = await BookingService.findAll(limit, offset, filters, sortOptions, {
    include: [{ association: "trip" }],
  });

  const totalPages = Math.ceil(count / limit);
  const dto = bookings.map((b) => b.toPassengerDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.BOOKING.RETRIEVED_ALL),
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages && totalPages > 0,
      hasPrevPage: page > 1,
    },
  });
});
