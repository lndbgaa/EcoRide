import IncidentService from "@/services/incident.service.js";
import catchAsync from "@/utils/catchAsync.js";
import parsePagination from "@/utils/parsePagination.js";

import type { IncidentDocument } from "@/models/mongo/Incident.model.js";
import type { Request, Response } from "express";

/**
 * Gère la récupération des incidents en attente de validation
 */
export const getPendingIncidents = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = parsePagination(req);

  const { count, incidents } = await IncidentService.getIncidentsByStatus("pending", limit, offset);

  const getDTO = (incident: IncidentDocument) => incident.toPreviewDTO();
  const incidentsDTO = incidents.map(getDTO);

  res.status(200).json({
    success: true,
    message: "Liste des incidents en attente de validation récupérée avec succès.",
    data: incidentsDTO,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});

/**
 * Gère la récupération des détails d'un incident par son id
 */
export const getIncidentDetails = catchAsync(async (req: Request, res: Response) => {
  const incidentId = req.params.id;

  const incident = await IncidentService.getIncidentById(incidentId);

  const dto = incident.toDetailedDTO();

  res.status(200).json({
    success: true,
    message: "Détails de l'incident récupérés avec succès.",
    data: dto,
  });
});

/**
 * Gère l'assignation d'un incident à un employé
 */
export const assignIncident = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const incidentId = req.params.id;

  await IncidentService.assignIncident(incidentId, employeeId);

  res.status(200).json({ success: true, message: "Incident assigné avec succès." });
});

/**
 * Gère la résolution d'un incident par un employé
 */
export const resolveIncident = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  const incidentId = req.params.id;
  const { note } = req.body;

  await IncidentService.resolveIncident(incidentId, employeeId, note);

  res.status(200).json({ success: true, message: "Incident résolu avec succès." });
});
