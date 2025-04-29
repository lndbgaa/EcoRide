import IncidentService from "@/services/incident.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { IncidentStatus } from "@/models/mongo/Incident.model.js";
import type { Request, Response } from "express";

/**
 * Gère la création d'un incident
 */
export const createIncident = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const data = req.body;

    await IncidentService.createIncident(userId, data);

    res
      .status(201)
      .json({ success: true, message: "Incident créé avec succès." });
  }
);

/**
 * Gère la récupération des incidents par statut
 */
export const getIncidentsByStatus = catchAsync(
  async (req: Request, res: Response) => {
    const currentUser = req.user;
    const status = req.query.status as IncidentStatus;
    const { page, limit, offset } = parsePagination(req);

    if (currentUser.role === "employee" && status !== "pending") {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'êtes pas autorisé à accéder à cette ressource.",
      });
    }

    const { count, incidents } = await IncidentService.getIncidentsByStatus(
      limit,
      offset,
      status
    );

    res.status(200).json({
      success: true,
      message: "Liste des incidents récupérée avec succès.",
      data: { incidents },
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }
);

/**
 * Gère la récupération des détails d'un incident par son id
 */
export const getIncidentDetails = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.user.id;
    const incidentId = req.params.id;

    const incident = await IncidentService.getIncidentById(
      employeeId,
      incidentId
    );

    res.status(200).json({
      success: true,
      message: "Détails de l'incident récupérés avec succès.",
      data: { incident: incident.toEmployeeDTO() },
    });
  }
);

/**
 * Gère l'assignation d'un incident à un employé
 */
export const assignIncident = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.user.id;
    const incidentId = req.params.id;

    await IncidentService.assignIncident(incidentId, employeeId);

    res
      .status(200)
      .json({ success: true, message: "Incident assigné avec succès." });
  }
);

/**
 * Gère la résolution d'un incident par un employé
 */
export const resolveIncident = catchAsync(
  async (req: Request, res: Response) => {
    const employeeId = req.user.id;
    const incidentId = req.params.id;
    const { note } = req.body;

    await IncidentService.resolveIncident(incidentId, employeeId, note);

    res
      .status(200)
      .json({ success: true, message: "Incident résolu avec succès." });
  }
);
