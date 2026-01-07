import { INCIDENT_STATUSES, SUCCESS_MESSAGES } from "@/constants";
import { IncidentService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetIncidentsFilters, GetIncidentsQuery, GetIncidentsSortOptions } from "@/types";
import type { Request, Response } from "express";

const { PENDING } = INCIDENT_STATUSES;

/**
 * Retrieve all incidents with paginated results.
 * Supports optional filtering by status and sorting by creation date.
 */
export const getIncidents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { status, sortDir }: GetIncidentsQuery = req.query;

  const filters: GetIncidentsFilters = { status };

  const sortOptions: GetIncidentsSortOptions = {
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

/**
 * Retrieve all pending incidents with paginated results.
 */
export const getPendingIncidents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const filters: GetIncidentsFilters = { status: PENDING };

  const { page, limit, offset } = parsePagination(req);

  const { count, incidents } = await IncidentService.findAll(limit, offset, filters);

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

/**
 * Retrieve detailed information about a specific incident by its ID.
 */
export const getIncidentDetails = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const incidentId = req.params.id!;

  const incident = await IncidentService.findById(incidentId);

  const dto = incident.toDetailedDTO();

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.INCIDENT.RETRIEVED),
    data: dto,
  });
});

/**
 * Assign an incident to the authenticated moderator/admin.
 */
export const assignIncident = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const moderator = req.user!;
  const incidentId = req.params.id!;

  await IncidentService.assign(incidentId, moderator);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.INCIDENT.ASSIGNED),
  });
});

/**
 * Resolve an incident with a resolution note by the authenticated moderator/admin.
 */
export const resolveIncident = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const moderator = req.user!;
  const incidentId = req.params.id!;
  const { note } = req.body;

  await IncidentService.resolve(incidentId, moderator, note);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.INCIDENT.RESOLVED),
  });
});
