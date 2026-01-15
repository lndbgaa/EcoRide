import { SUCCESS_MESSAGES } from "@/constants";
import { UserService } from "@/services";
import { catchAsync, parsePagination } from "@/utils";

import type { GetUsersFilters, GetUsersQuery, GetUsersSortOptions, UpdateUserRolePayload } from "@/types";
import type { Request, Response } from "express";

/**
 *
 */
export const getUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { status, role, search, sortBy, sortDir }: GetUsersQuery = req.query;

  const filters: GetUsersFilters = { status, role, search };

  const sortOptions: GetUsersSortOptions = {
    by: sortBy ?? "createdAt",
    dir: sortDir ?? "desc",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, users } = await UserService.findAll(limit, offset, filters, sortOptions);

  const totalPages = Math.ceil(count / limit);
  const dto = users.map((u) => u.toAdminDTO(req.t));

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.RETRIEVED_ALL),
    data: dto,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages && totalPages > 0,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * Suspend a user account by the authenticated admin.
 */
export const suspendUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;
  const admin = req.user!;

  const user = await UserService.suspendByAdmin(userId, admin);
  const dto = user.toAdminDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.SUSPENDED),
    data: dto,
  });
});

/**
 * Reactivate a suspended user account by the authenticated admin.
 */
export const reactivateUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;
  const admin = req.user!;

  const user = await UserService.reactivateByAdmin(userId, admin);
  const dto = user.toAdminDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.REACTIVATED),
    data: dto,
  });
});

/**
 * Change a user role by the authenticated admin.
 */
export const changeUserRole = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id!;
  const admin = req.user!;
  const data: UpdateUserRolePayload = req.body;

  const user = await UserService.changeUserRoleByAdmin(userId, data.role, admin);
  const dto = user.toAdminDTO(req.t);

  return res.status(200).json({
    success: true,
    message: req.t(SUCCESS_MESSAGES.USER.ROLE_CHANGED),
    data: dto,
  });
});
