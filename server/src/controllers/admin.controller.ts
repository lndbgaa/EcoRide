import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import Employee from "@/models/mysql/Employee.model.js";
import AuthService from "@/services/auth.service";
import catchAsync from "@/utils/catchAsync.js";
import type { Request, Response } from "express";

export const registerEmployee = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

  const token = await AuthService.register(Employee, ACCOUNT_ROLES_LABEL.EMPLOYEE, data);

  return res.status(200).json({ success: true, token });
});
