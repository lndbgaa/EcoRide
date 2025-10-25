import { ERROR_MESSAGES } from "@/constants";
import { AppError } from "@/utils";

import { User } from "@/models/mysql";

import type { FindOptions } from "sequelize";

class UserService {
  public static async findUserById(id: string, options?: FindOptions): Promise<User> {
    const user = await User.findOne({ where: { id }, ...options });

    if (!user) {
      throw new AppError({
        statusCode: 404,
        userMessage: ERROR_MESSAGES.USER.NOT_FOUND,
      });
    }

    return user;
  }
}

export { UserService };
