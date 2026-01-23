import bcrypt from "bcrypt";
import ms from "ms";
import { nanoid } from "nanoid";
import { UniqueConstraintError } from "sequelize";

import { appConfig, dayjs, sequelize } from "@/config";
import {
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  DEBUG_CODES,
  DUMMY_PASSWORD_HASH,
  REFRESH_TOKEN_LENGTH,
  USER_ROLES_ID,
  USER_ROLES_KEY
} from "@/constants";
import { RefreshToken, User } from "@/models";
import { EmailVerificationService, PreferenceService } from "@/services";
import { AppError, generateJwt } from "@/utils";

import type { AuthResponse, LoginUserPayload, RegisterUserPayload } from "@/types";

const { auth } = appConfig;
const { refreshExpiration, accessSecret, accessExpiration } = auth;

export class AuthService {
  /**
   * Registers a new user.
   * Creates default preferences and sends a verification email with a confirmation link to the user's email address.
   *
   * @param {RegisterUserPayload} data - The user data to register.
   * @returns {Promise<User>} The registered user instance.
   * @throws {AppError} 409 if email or username is already in use.
   * @throws {AppError} 500 if sending the verification email fails (from EmailVerificationService.sendVerificationLinkToUser).
   */
  public static async register(data: RegisterUserPayload): Promise<User> {
    const { email, username, password, firstName, lastName, birthDate } = data;

    try {
      const user = await sequelize.transaction(async (t) => {
        const user = await User.create(
          {
            role_id: USER_ROLES_ID.USER,
            email,
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            birth_date: dayjs(birthDate).toDate(),
          },
          { transaction: t }
        );

        await PreferenceService.createUserDefaultPreferences(user, t);

        return user;
      });

      await EmailVerificationService.sendVerificationLinkToUser(user);

      return user;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        const field = err.errors[0]?.path;

        throw new AppError({
          statusCode: 409,
          userMessageKey:
            field === "email" ? AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS : AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
        });
      }
      throw err;
    }
  }

  /**
   * Logs in a user.
   *
   * @param {LoginUserPayload} data - The user data to log in.
   * @returns {Promise<AuthResponse>} The authentication response.
   * @throws {AppError} 401 if user does not exist or password is invalid.
   * @throws {AppError} 403 if user account is not verified.
   * @throws {AppError} 403 if user account is suspended.
   * @throws {AppError} 403 if user account is pending deletion.
   */
  public static async login(data: LoginUserPayload): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await User.findOne({
      where: { email },
      include: [{ association: "role" }],
    });

    const passwordValid = user ? await user.checkPassword(password) : await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

    if (!user || !passwordValid) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    if (!user.email_is_verified) {
      throw new AppError({
        statusCode: 403,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_EMAIL_NOT_VERIFIED,
        code: AUTH_ERROR_CODES.ACCOUNT_EMAIL_NOT_VERIFIED,
      });
    }

    if (user.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        code: AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
      });
    }

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 403,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_PENDING_DELETION,
        code: AUTH_ERROR_CODES.ACCOUNT_PENDING_DELETION,
      });
    }

    const refreshToken = await sequelize.transaction(async (t) => {
      await RefreshToken.update(
        { revoked_at: dayjs().toDate() },
        { where: { user_id: user.id, revoked_at: null }, transaction: t }
      );

      const refreshTokenRecord = await RefreshToken.create(
        {
          token: nanoid(REFRESH_TOKEN_LENGTH),
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
   * Logs out a user by revoking their refresh token.
   *
   * @param {string} refreshToken - The refresh token to revoke.
   * @returns {Promise<void>}
   */
  public static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.update({ revoked_at: dayjs().toDate() }, { where: { token: refreshToken, revoked_at: null } });
  }

  /**
   * Refreshes a user's access token.
   *
   * @param {string} refreshToken - The refresh token to use for refreshing the access token.
   * @returns {Promise<AuthResponse>} The authentication response.
   * @throws {AppError} 401 if token is not found, expired, revoked, or already used.
   * @throws {AppError} 401 if associated user does not exist.
   * @throws {AppError} 403 if user account is suspended or pending deletion.
   */
  public static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const refreshTokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!refreshTokenRecord) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        debugMessage: "Refresh token not found in database.",
        code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_NOT_FOUND,
      });
    }

    if (refreshTokenRecord.isUsed()) {
      await RefreshToken.update(
        { revoked_at: dayjs().toDate() },
        { where: { user_id: refreshTokenRecord.user_id, revoked_at: null } }
      );

      // TODO envoyer un mail à l'utilisateur

      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        debugMessage: "Refresh token has already been used.",
        code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_REUSED,
      });
    }

    if (refreshTokenRecord.isRevoked()) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        debugMessage: "Refresh token has been revoked.",
        code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_REVOKED,
      });
    }

    if (refreshTokenRecord.isExpired()) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        debugMessage: "Refresh token has expired.",
        code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.REFRESH_TOKEN_EXPIRED,
      });
    }

    const user = await User.findOne({
      where: { id: refreshTokenRecord.user_id },
      include: [{ association: "role" }],
    });

    if (!user) {
      throw new AppError({
        statusCode: 401,
        userMessageKey: AUTH_ERROR_MESSAGES.SESSION_INVALID,
        debugMessage: "User not found in database for valid refresh token.",
        code: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
        debugCode: DEBUG_CODES.AUTH.USER_NOT_FOUND,
      });
    }

    if (user.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        code: AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
      });
    }

    if (user.isPendingDeletion()) {
      throw new AppError({
        statusCode: 403,
        userMessageKey: AUTH_ERROR_MESSAGES.ACCOUNT_PENDING_DELETION,
        code: AUTH_ERROR_CODES.ACCOUNT_PENDING_DELETION,
      });
    }

    const newRefreshToken = await sequelize.transaction(async (t) => {
      await refreshTokenRecord.markAsUsed({ transaction: t });

      const newRefreshTokenRecord = await RefreshToken.create(
        {
          token: nanoid(REFRESH_TOKEN_LENGTH),
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
}
