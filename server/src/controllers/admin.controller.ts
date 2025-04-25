import type { Request, Response } from "express";

import AdminService from "@/services/admin.service.js";
import AuthService from "@/services/auth.service.js";
import catchAsync from "@/utils/catchAsync.js";

// 🔑 Création d'un compte employé
export const registerEmployee = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  await AuthService.registerEmployee(data);

  return res.status(201).json({ success: true, message: "Compte employé créé avec succès." });
});

// 🔑 Suspension d'un compte
export const suspendAccount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await AdminService.suspendAccount(id);

  return res.status(200).json({ success: true, message: "Compte suspendu avec succès." });
});

// 🔑 Réactivation d'un compte
export const unsuspendAccount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await AdminService.unsuspendAccount(id);

  return res.status(200).json({ success: true, message: "Compte réactivé avec succès." });
});
