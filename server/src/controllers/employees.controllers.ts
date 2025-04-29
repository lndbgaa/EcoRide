import type { IncidentStatus } from "@/models/mongo/Incident.model";
import type { Request, Response } from "express";

import IncidentService from "@/services/incident.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

/**
 * Gère la récupération des incidents d'un employé
 */
export const getEmployeeIncidents = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.params.id;
    const currentUser = req.user;
    const status = (req.query.status as IncidentStatus) || undefined;
    const { page, limit, offset } = parsePagination(req);

    // Un employé ne peut accéder qu'à ses propres incidents
    // L'admin lui peut visualiser tous les incidents gérer par un employé
    if (currentUser.role === "employee" && currentUser.id !== employeeId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'êtes pas autorisé à accéder à cette ressource.",
      });
    }

    const { count, incidents } = await IncidentService.getEmployeeIncidents(
      employeeId,
      limit,
      offset,
      status
    );

    res.status(200).json({
      success: true,
      message: "Incidents récupérés avec succès",
      data: { incidents },
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / (limit ?? 10)),
      },
    });
  }
);
