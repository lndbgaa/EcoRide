import { SUCCESS_MESSAGES } from "@/constants";
import { Booking } from "@/models";
import { EventService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { EventType } from "@/types";
import type { Request, Response } from "express";

/**
 * Retrieve the next upcoming event (trip or booking) for the authenticated user.
 */
export const getMyNextEvent = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const event = await EventService.getNextEventforUser(user);

  const dto = event ? (event instanceof Booking ? event.toPassengerDTO(req.t) : event.toDriverDTO(req.t)) : null;
  const eventType: EventType | null = event ? (event instanceof Booking ? "booking" : "trip") : null;

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.EVENT.NEXT_EVENT_RETRIEVED),
    data: {
      eventType,
      event: dto,
    },
  });
});

/**
 * Retrieve paginated upcoming events (trips and bookings) for the authenticated user.
 */
export const getMyUpcomingEvents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;

  const { page, limit, offset } = parsePagination(req);

  const { count, events } = await EventService.getUpcomingEventsforUser(limit, offset, user);

  const totalPages = Math.ceil(count / limit);
  const dto = events.map((e) => {
    const { type, data } = e;
    const eventDto = type === "booking" ? data.toPassengerDTO(req.t) : data.toDriverDTO(req.t);
    return { eventType: type, event: eventDto };
  });

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.EVENT.UPCOMING_EVENTS_RETRIEVED),
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
