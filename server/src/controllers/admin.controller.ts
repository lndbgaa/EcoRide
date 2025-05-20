import AccountService from "@/services/account.service";
import AdminService from "@/services/admin.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

/**
 * Récupère tous les comptes (utilisateurs, employés et administrateurs).
 */
export const getAllAccounts = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const accounts = await AccountService.getAllAccounts();

  const dto = accounts.map((account) => {
    return {
      id: account.id,
      email: account.email,
      role: account.role?.label,
      status: account.status,
    };
  });

  res.status(200).json({ data: dto });
});

/**
 * Gère la suspension d'un compte (utilisateur ou employé).
 */
export const suspendAccount = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await AdminService.suspendAccount(id);

  res.sendStatus(204);
});

/**
 * Gère la réactivation d'un compte (utilisateur ou employé).
 */
export const unsuspendAccount = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await AdminService.unsuspendAccount(id);

  res.sendStatus(204);
});
