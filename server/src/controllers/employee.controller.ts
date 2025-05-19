import IncidentService from "@/services/incident.service.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { Request, Response } from "express";

/**
 * Gère la récupération des incidents assignés à un employé et non résolus
 */
export const getEmployeeAssignedIncidents = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const { page, limit, offset } = parsePagination(req);

  const { count, incidents } = await IncidentService.getEmployeeIncidents(employeeId, "assigned", limit, offset);

  const incidentsDTO = incidents.map((incident) => incident.toPreviewDTO());

  res.status(200).json({
    success: true,
    message: "Liste des incidents assignés récupérée avec succès",
    data: incidentsDTO,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / (limit ?? 10)),
    },
  });
});

/**
 * Gère la récupération des incidents résolus d'un employé
 */
export const getEmployeeResolvedIncidents = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const { page, limit, offset } = parsePagination(req);

  const { count, incidents } = await IncidentService.getEmployeeIncidents(employeeId, "resolved", limit, offset);

  const incidentsDTO = incidents.map((incident) => incident.toPreviewDTO());

  res.status(200).json({
    success: true,
    message: "Liste des incidents résolus récupérée avec succès",
    data: incidentsDTO,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / (limit ?? 10)),
    },
  });
});
