import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import Employee from "@/models/mysql/Employee.model.js";
import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";
import { generateToken } from "@/utils/jwt.utils.js";
import type { Request, Response } from "express";

export const registerEmployee = catchAsync(async (req: Request, res: Response) => {
  const { email, pseudo, password, firstName, lastName } = req.body;

  const emailExists = await AccountService.isEmailTaken(email);

  if (emailExists) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Un compte avec cet email existe déjà.",
    });
  }

  const pseudoExists = await AccountService.isPseudoTaken(pseudo);

  if (pseudoExists) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Le pseudo est déjà pris.",
    });
  }

  const newEmployee = await Employee.createOne({
    email,
    pseudo,
    password,
    first_name: firstName,
    last_name: lastName,
  });

  const jwt = generateToken({ id: newEmployee.id, role: ACCOUNT_ROLES_LABEL.EMPLOYEE });

  return res.status(200).json({ success: true, user: newEmployee.toPrivateJSON(), token: jwt });
});
