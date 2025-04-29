import type { Request, Response } from "express";

import AdminService from "@/services/admin.service.js";
import AuthService from "@/services/auth.service.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la création d'un compte employé.
 */
export const registerEmployee = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;

    await AuthService.registerEmployee(data);

    res.status(201).json({ success: true, message: "Compte employé créé avec succès." });
  }
);

/**
 * Gère la suspension d'un compte (utilisateur ou employé).
 */
export const suspendAccount = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await AdminService.suspendAccount(id);

    res.status(200).json({ success: true, message: "Compte suspendu avec succès." });
  }
);

/**
 * Gère la réactivation d'un compte (utilisateur ou employé).
 */
export const unsuspendAccount = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await AdminService.unsuspendAccount(id);

    res.status(200).json({ success: true, message: "Compte réactivé avec succès." });
  }
);
