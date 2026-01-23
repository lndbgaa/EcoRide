import { Op } from "sequelize";

import { BOOKING_STATUSES, SUCCESS_MESSAGES, VEHICLE_ASSOCIATIONS } from "@/constants";
import { User, Vehicle } from "@/models";
import { PreferenceService, TripService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { Preference } from "@/models";
import type { CreateTripPayload, SearchTripsPayload } from "@/types";
import type { Request, Response } from "express";

/**
 * Search for trips based on user-provided criteria and returns paginated results.
 */
export const searchTrips = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;
  const data: SearchTripsPayload = req.body;

  const { page, limit, offset } = parsePagination(req);

  const { count, trips } = await TripService.search(data, limit, offset, user);

  const totalPages = Math.ceil(count / limit);
  const dto = trips.map((t) => t.toPublicDTO(req.t));

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
 * Retrieve public trip details including driver info, vehicle, preferences and passengers.
 */
export const getPublicTripDetails = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const tripId = req.params.id!;

  const trip = await TripService.findById(tripId, {
    include: [
      { association: "driver", model: User.scope("withDeleted") },
      { association: "vehicle", model: Vehicle.scope("withDeleted"), include: VEHICLE_ASSOCIATIONS },
      {
        association: "bookings",
        include: [{ association: "passenger", model: User.scope("withDeleted") }],
        where: { status: { [Op.ne]: BOOKING_STATUSES.CANCELLED } },
        required: false,
      },
    ],
  });

  let preferences: Preference[] | null = null;

  if (trip.driver && !trip.driver.isDeleted) {
    preferences = await PreferenceService.getUserPreferences(trip.driver);
  }

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.RETRIEVED),
    data: {
      trip: trip.toPublicDTO(req.t),
      preferences: preferences ? preferences.map((p) => p.toDTO(req.t)) : null,
      passengers: trip.bookings?.filter((b) => b.passenger).map((b) => b.passenger!.toPublicDTO()),
    },
  });
});

/**
 * Create a new trip for the authenticated user.
 */
export const createTrip = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const data: CreateTripPayload = req.body;

  const trip = await TripService.create(user, data);
  const dto = trip.toDriverDTO(req.t);

  return res.status(201).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.CREATED),
    data: dto,
  });
});

/**
 * Cancel an existing trip for the authenticated user.
 */
export const cancelTrip = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const tripId = req.params.id!;

  const trip = await TripService.cancel(user, tripId);
  const dto = trip.toDriverDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.CANCELLED),
    data: dto,
  });
});

/**
 * Mark a trip as started for the authenticated user.
 */
export const startTrip = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const tripId = req.params.id!;

  const trip = await TripService.start(user, tripId);
  const dto = trip.toDriverDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.STARTED),
    data: dto,
  });
});

/**
 * Mark a trip as ended for the authenticated user.
 */
export const endTrip = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const tripId = req.params.id!;

  const trip = await TripService.end(user, tripId);
  const dto = trip.toDriverDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.TRIP.ENDED),
    data: dto,
  });
});
