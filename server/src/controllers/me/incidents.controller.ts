import { INCIDENT_STATUSES, SUCCESS_MESSAGES } from "@/constants";
import { IncidentService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetIncidentsFilters, GetIncidentsSortOptions, GetMyIncidentsQuery } from "@/types";
import type { Request, Response } from "express";

const { ASSIGNED, RESOLVED } = INCIDENT_STATUSES;

/**
 * Retrieve all incidents assigned to the authenticated moderator/admin with paginated results.
 * Supports optional filtering by status (excluding pending) and sorting by assignment or resolution date.
 */
export const getMyIncidents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const user = req.user!;
  const { status, sortDir }: GetMyIncidentsQuery = req.query;

  const filters: GetIncidentsFilters = {
    moderatorId: user.id,
    status,
  };

  const sortOptions: GetIncidentsSortOptions = {
    by: status === ASSIGNED ? "assignedAt" : status === RESOLVED ? "resolvedAt" : "createdAt",
    dir: sortDir ?? "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, incidents } = await IncidentService.findAll(limit, offset, filters, sortOptions);

  const totalPages = Math.ceil(count / limit);
  const dto = incidents.map((i) => i.toPreviewDTO());

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.INCIDENT.RETRIEVED_ALL),
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
