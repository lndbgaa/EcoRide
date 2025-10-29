import bcrypt from "bcrypt";
import dayjs from "dayjs";
import ms from "ms";
import { nanoid } from "nanoid";

import { appConfig, sequelize } from "@/config";
import { DEBUG_CODES, ERROR_CODES, ERROR_MESSAGES, USER_ROLES_ID, USER_ROLES_KEY } from "@/constants";
import { RefreshToken, User } from "@/models/mysql";
import { EmailVerificationService } from "@/services";
import { AppError, generateJwt } from "@/utils";

import type { AuthResponse, LoginUserPayload, RegisterUserPayload } from "@/types";

const { auth } = appConfig;
const { refreshExpiration, accessSecret, accessExpiration } = auth;

class AuthService {
  /**
   * Checks if an email is already in use.
   *
   * @param {string} email - The email to check.
   * @returns {Promise<void>}
   * @throws {AppError} - If the email is already in use.
   */
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

  /**
   * Checks if a username is already in use.
   *
   * @param {string} username - The username to check.
   * @returns {Promise<void>}
   * @throws {AppError} - If the username is already in use.
   */
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

  /**
   * Registers a new user.
   *
   * @param {RegisterUserPayload} data - The user data to register.
   * @returns {Promise<User>} The registered user.
   * @throws {AppError} - If email or username is already in use.
   */
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

  /**
   * Logs in a user.
   *
   * @param {LoginUserPayload} data - The user data to log in.
   * @returns {Promise<AuthResponse>} The authentication response.
   * @throws {AppError} - If the user does not exist, the credentials are invalid, or the account
   * is suspended, pending deletion, or not verified.
   */
  public static async loginUser(data: LoginUserPayload): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await User.findOne({
      where: { email },
      include: [{ association: "role" }],
    });

    if (!user) {
      await bcrypt.hash(password, 10);
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    if (!(await user.checkPassword(password))) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    if (!user.is_verified) {
      throw new AppError({
        statusCode: 403,
        userMessage: ERROR_MESSAGES.AUTH.ACCOUNT_EMAIL_NOT_VERIFIED,
        code: ERROR_CODES.AUTH.ACCOUNT_EMAIL_NOT_VERIFIED,
      });
    }

    if (user.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        userMessage: ERROR_MESSAGES.AUTH.ACCOUNT_SUSPENDED,
        code: ERROR_CODES.AUTH.ACCOUNT_SUSPENDED,
      });
    }

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 403,
        userMessage: ERROR_MESSAGES.AUTH.ACCOUNT_PENDING_DELETION,
        code: ERROR_CODES.AUTH.ACCOUNT_PENDING_DELETION,
      });
    }

    const refreshToken = await sequelize.transaction(async (t): Promise<string> => {
      await RefreshToken.update(
        { revoked_at: dayjs().toDate() },
        { where: { user_id: user.id, revoked_at: null }, transaction: t }
      );

      const refreshTokenRecord = await RefreshToken.create(
        {
          token: nanoid(),
          user_id: user.id,
          expires_at: dayjs().add(ms(refreshExpiration), "ms").toDate(),
        },
        { transaction: t }
      );

      user.last_login = dayjs().toDate();
      await user.save({ transaction: t, fields: ["last_login"] });

      return refreshTokenRecord.token;
    });

    const userRole = user.role?.key ?? USER_ROLES_KEY.USER;

    const accessToken = generateJwt({ id: user.id, role: userRole }, accessSecret, accessExpiration);

    return { refreshToken, accessToken };
  }

  /**
   * Refreshes a user's access token.
   *
   * @param {string} refreshToken - The refresh token to use for refreshing the access token.
   * @returns {Promise<AuthResponse>} The authentication response.
   * @throws {AppError} - If the refresh token is invalid, expired, or already used, or if the associated
   * user does not exist, is suspended, or pending deletion.
   */
  public static async refreshUserToken(refreshToken: string): Promise<AuthResponse> {
    const refreshTokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!refreshTokenRecord) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: "Refresh token not found in database",
        code: ERROR_CODES.AUTH.SESSION_INVALID,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_NOT_FOUND,
      });
    }

    if (refreshTokenRecord.isUsed()) {
      await RefreshToken.update(
        { revoked_at: dayjs().toDate() },
        { where: { user_id: refreshTokenRecord.user_id, revoked_at: null } }
      );

      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: "Refresh token has already been used",
        code: ERROR_CODES.AUTH.SESSION_INVALID,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_REUSED,
      });
    }

    if (refreshTokenRecord.isRevoked()) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: "Refresh token has been revoked",
        code: ERROR_CODES.AUTH.SESSION_INVALID,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_REVOKED,
      });
    }

    if (refreshTokenRecord.isExpired()) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: "Refresh token has expired",
        code: ERROR_CODES.AUTH.SESSION_INVALID,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_EXPIRED,
      });
    }

    const user = await User.findOne({ where: { id: refreshTokenRecord.user_id } });

    if (!user) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: "User not found for valid refresh token",
        code: ERROR_CODES.AUTH.SESSION_INVALID,
        debugCode: DEBUG_CODES.AUTH.USER_NOT_FOUND,
      });
    }

    if (user.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        userMessage: ERROR_MESSAGES.AUTH.ACCOUNT_SUSPENDED,
        code: ERROR_CODES.AUTH.ACCOUNT_SUSPENDED,
      });
    }

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 403,
        userMessage: ERROR_MESSAGES.AUTH.ACCOUNT_PENDING_DELETION,
        code: ERROR_CODES.AUTH.ACCOUNT_PENDING_DELETION,
      });
    }

    const newRefreshToken = await sequelize.transaction(async (t): Promise<string> => {
      await refreshTokenRecord.markAsUsed({ transaction: t });

      const newRefreshTokenRecord = await RefreshToken.create(
        {
          token: nanoid(),
          user_id: user.id,
          expires_at: dayjs().add(ms(refreshExpiration), "ms").toDate(),
        },
        { transaction: t }
      );

      return newRefreshTokenRecord.token;
    });

    const userRole = user.role?.key ?? USER_ROLES_KEY.USER;

    const newAccessToken = generateJwt({ id: user.id, role: userRole }, accessSecret, accessExpiration);

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
  }

  /**
   * Logs out a user by revoking their refresh token.
   *
   * @param {string} refreshToken - The refresh token to revoke.
   * @returns {Promise<void>}
   */
  public static async logoutUser(refreshToken: string): Promise<void> {
    await RefreshToken.update(
      { revoked_at: dayjs().toDate() },
      { where: { token: refreshToken, revoked_at: null } }
    );
  }
}

export { AuthService };
