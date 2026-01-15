import { Op } from "sequelize";

import { COMMON_ERROR_MESSAGES, USER_ROLES_ID, USER_ROLES_KEY } from "@/constants";
import { User } from "@/models/mysql";
import { AppError } from "@/utils";

import type { GetUsersFilters, GetUsersResponse, GetUsersSortOptions, UserSortField } from "@/types";
import type { FindOptions, Order, WhereOptions } from "sequelize";

const { ADMIN, USER } = USER_ROLES_KEY;

export class UserService {
  /**
   * Finds a user by their ID.
   *
   * @param {string} userId - The ID of the user.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<User>} - The returned user instance.
   * @throws {AppError} 404 if user is not found.
   */
  public static async findById(userId: string, options?: FindOptions): Promise<User> {
    const user = await User.findByPk(userId, options);

    if (!user) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[UserService.findById] User '${userId}' not found in database.`,
      });
    }

    return user;
  }

  /**
   *
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetUsersFilters,
    sortOptions?: GetUsersSortOptions,
    options?: Partial<FindOptions>
  ): Promise<GetUsersResponse> {
    const where: WhereOptions = {};

    if (filters?.role) where["$role.key$"] = filters.role;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      (where as any)[Op.or] = [
        { first_name: { [Op.like]: `%${filters.search}%` } },
        { last_name: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } },
        { username: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const sortFieldMap: Record<UserSortField, string> = {
      createdAt: "created_at",
      username: "username",
    };

    const sortField = sortFieldMap[sortOptions?.by ?? "createdAt"] ?? "created_at";
    const sortDirection = sortOptions?.dir === "asc" ? "ASC" : "DESC";
    const order: Order = [[sortField, sortDirection]];

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ association: "role" }],
      limit,
      offset,
      order,
      ...options,
      distinct: true,
    });

    return { count, users: rows };
  }

  /**
   * Suspend a user account by an admin.
   *
   * @param {string} userId - The ID of the user to suspend.
   * @param {User} admin - The admin performing the suspension.
   *  @returns {Promise<User>} - The updated user with status set to suspended.
   * @throws {AppError} 404 if user is not found (from this.findById()).
   * @throws {AppError} 400 if admin tries to suspend their own account or another admin account.
   * @throws {AppError} 400 if user cannot transition to suspended status (from user.markAsSuspended()).
   */
  public static async suspendByAdmin(userId: string, admin: User): Promise<User> {
    const user = await this.findById(userId, {
      include: [{ association: "role" }],
    });

    if (user.id === admin.id || user.role?.key === ADMIN) {
      const reason = user.id === admin.id ? "their own account" : `another admin ${user.id}`;
      throw new AppError({
        statusCode: 400,
        userMessageKey: COMMON_ERROR_MESSAGES.FORBIDDEN_ACCESS,
        debugMessage: `[UserService.suspendByAdmin] Admin ${admin.id} cannot suspend ${reason}.`,
      });
    }

    await user.markAsSuspended();
    return user;
  }

  /**
   * Reactivate a suspended user account by an admin.
   *
   * @param {string} userId - The ID of the user to reactivate.
   * @param {User} admin - The admin performing the reactivation.
   * @returns {Promise<User>} - The updated user with status set to active.
   * @throws {AppError} 404 if user is not found (from this.findById()).
   * @throws {AppError} 400 if admin tries to reactivate their own account or another admin account.
   * @throws {AppError} 400 if user cannot transition to active status (from user.markAsActive()).
   */
  public static async reactivateByAdmin(userId: string, admin: User): Promise<User> {
    const user = await this.findById(userId, {
      include: [{ association: "role" }],
    });

    if (user.id === admin.id || user.role?.key === ADMIN) {
      const reason = user.id === admin.id ? "their own account" : `another admin ${user.id}`;
      throw new AppError({
        statusCode: 400,
        userMessageKey: COMMON_ERROR_MESSAGES.FORBIDDEN_ACCESS,
        debugMessage: `[UserService.reactivateByAdmin] Admin ${admin.id} cannot reactivate ${reason}.`,
      });
    }

    await user.markAsActive();
    return user;
  }

  /**
   * Change a user's role by an admin.
   *
   * @param {string} userId - The ID of the user whose role to change.
   * @param {string} newRoleKey - The new role key ("user" or "moderator").
   * @param {User} admin - The admin performing the role change.
   * @returns {Promise<User>} - The updated user with the new role.
   * @throws {AppError} 404 if user is not found (from this.findById()).
   * @throws {AppError} 400 if admin tries to change their own role or another admin's role.
   */
  public static async changeUserRoleByAdmin(userId: string, newRoleKey: string, admin: User): Promise<User> {
    const user = await this.findById(userId, {
      include: [{ association: "role" }],
    });

    if (user.id === admin.id || user.role?.key === ADMIN) {
      const reason = user.id === admin.id ? "their own role" : `another admin ${user.id}'s role`;
      throw new AppError({
        statusCode: 400,
        userMessageKey: COMMON_ERROR_MESSAGES.FORBIDDEN_ACCESS,
        debugMessage: `[UserService.changeUserRoleByAdmin] Admin ${admin.id} cannot change ${reason}.`,
      });
    }

    const newRoleId = newRoleKey === USER ? USER_ROLES_ID.USER : USER_ROLES_ID.MODERATOR;

    user.role_id = newRoleId;
    await user.save({ fields: ["role_id"] });

    return await this.findById(userId, {
      include: [{ association: "role" }],
    });
  }
}
