import IncidentService from "@/services/incident.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

export const createIncident = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const data = req.body;

    await IncidentService.createIncident(userId, data);

    res.status(201).json({ success: true, message: "" });
  }
);
