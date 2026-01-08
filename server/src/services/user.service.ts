import { COMMON_ERROR_MESSAGES } from "@/constants";
import { User } from "@/models/mysql";
import { AppError } from "@/utils";

import type { FindOptions } from "sequelize";

export class UserService {
  /**
   * Finds a user by their ID.
   *
   * @param {string} userId - The ID of the user.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<User>} - The returned user instance.
   * @throws {AppError} - If:
   *   - The user is not found (HTTP 404).
   */
  public static async findById(userId: string, options?: FindOptions): Promise<User> {
    const user = await User.findByPk(userId, options);

    if (!user) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[UserService.findById] Review '${userId}' not found in database.`,
      });
    }

    return user;
  }
}
