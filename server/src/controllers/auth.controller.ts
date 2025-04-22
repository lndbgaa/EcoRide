import User from "@/models/mysql/User.model";
import AuthService from "@/services/auth.service.js";
import catchAsync from "@/utils/catchAsync.js";
import type { Request, Response } from "express";
import { ACCOUNT_ROLES_LABEL } from "../constants";

/**
 * Gère l'inscription d'un utilisateur standard
 *
 * (Les employés sont gérés par l'admin avec /admin/create-employee)
 */
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const token = await AuthService.register(User, ACCOUNT_ROLES_LABEL.USER, data);

  return res.status(200).json({ success: true, token });
});

/**
 * Gère la connexion de tout type de compte (user, admin, employee)
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const token = await AuthService.login(email, password);

  res.status(200).json({ success: true, token });
});

/**
 * Gère la déconnexion d'un compte
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { accountId } = req.body;

  await AuthService.logout(accountId);

  res.status(200).json({ success: true });
});
