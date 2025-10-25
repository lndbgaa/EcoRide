import { ERROR_MESSAGES, USER_ROLES_ID } from "@/constants";
import { User } from "@/models/mysql";
import { EmailVerificationService } from "@/services";
import { AppError } from "@/utils";

import type { RegisterUserPayload } from "@/types";

class AuthService {
  public static async assertEmailIsUnique(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ where: { email: cleanEmail } });

    if (exists) {
      throw new AppError({
        statusCode: 409,
        userMessage: ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
      });
    }
  }

  public static async assertUsernameIsUnique(username: string): Promise<void> {
    const cleanUsername = username.trim().toLowerCase();

    const exists = await User.findOne({ where: { username: cleanUsername } });

    if (exists) {
      throw new AppError({
        statusCode: 409,
        userMessage: ERROR_MESSAGES.AUTH.USERNAME_ALREADY_EXISTS,
      });
    }
  }

  public static async registerUser(data: RegisterUserPayload): Promise<User> {
    const { email, username, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);
    await this.assertUsernameIsUnique(username);

    const newUser = await User.create({
      role_id: USER_ROLES_ID.USER,
      email,
      username,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    await EmailVerificationService.sendVerificationLinkToUser(newUser);

    return newUser;
  }
}

export { AuthService };
