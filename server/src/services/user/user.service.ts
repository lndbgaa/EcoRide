import { COMMON_ERROR_MESSAGES } from "@/constants";
import { User } from "@/models/mysql";
import { AppError } from "@/utils";

import type { FindOptions } from "sequelize";

export class UserService {
  /**
   * Finds a user by their ID.
   *
   * @param {string} userId - The ID of the user.
   * @param {404 | 500} [notFoundStatus=500] - The HTTP status code to use if the user is not found.
   *   - 404: Resource not found.
   *   - 500: Internal server error.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<User>} - The found user.
   * @throws {AppError} - If the user is not found.
   */
  public static async findById(userId: string, notFoundStatus: 404 | 500 = 500, options?: FindOptions): Promise<User> {
    const user = await User.findByPk(userId, options);

    if (!user) {
      throw new AppError({
        statusCode: notFoundStatus,
        userMessageKey: notFoundStatus === 404 ? COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND : COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        debugMessage: `User with ID ${userId} not found in database`,
      });
    }

    return user;
  }
}
