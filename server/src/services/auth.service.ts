import dayjs from "dayjs";
import ms from "ms";
import { nanoid } from "nanoid";

import config from "@/config/app.config.js";
import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import { Employee, RefreshToken, User } from "@/models/mysql";
import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";
import { generateToken } from "@/utils/jwt.utils.js";

import type {
  LoginDTO,
  LoginResult,
  RefreshAccessTokenResult,
  RegisterEmployeeDTO,
  RegisterUserDTO,
  RegisterUserResult,
} from "@/types/auth.types.js";

const { accessSecret, accessExpiration, refreshExpiration } = config.jwt;

class AuthService {
  private static async assertEmailIsUnique(email: string): Promise<void> {
    const emailExists = await AccountService.doesEmailExist(email);

    if (emailExists) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un compte avec cet email existe déjà.",
      });
    }
  }

  private static async assertPseudoIsUnique(pseudo: string): Promise<void> {
    const pseudoExists = await AccountService.doesPseudoExist(pseudo);

    if (pseudoExists) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Le pseudo est déjà pris.",
      });
    }
  }

  /**
   * Création d'un compte (type utilisateur)
   *
   * Note : Après inscription, l'utilisateur est automatiquement connecté.
   *
   * @param data - Données du compte
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async registerUser(data: RegisterUserDTO): Promise<RegisterUserResult> {
    const { email, pseudo, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);
    await this.assertPseudoIsUnique(pseudo);

    return await sequelize.transaction(async (transaction) => {
      const now = dayjs();

      const newUser: User = await User.create(
        {
          email,
          pseudo,
          password,
          first_name: firstName,
          last_name: lastName,
        },
        { transaction }
      );

      const accountId = newUser.getId();

      const refreshToken = await RefreshToken.create(
        {
          account_id: accountId,
          token: nanoid(),
          expires_at: now.add(ms(refreshExpiration), "ms").toDate(),
        },
        { transaction }
      );

      const accessToken = generateToken(
        { id: accountId, role: ACCOUNT_ROLES_LABEL.USER },
        accessSecret,
        accessExpiration
      );

      return {
        accountId,
        accessToken,
        refreshToken: refreshToken.token,
      };
    });
  }

  /**
   * Création d'un compte (type employé)
   *
   * Note : Un compte employé est créé par un administrateur donc il n'est pas automatiquement connecté.
   *
   * @param data - Données du compte (email, mot de passe, prénom, nom)
   * @returns ID du compte
   */
  public static async registerEmployee(data: RegisterEmployeeDTO): Promise<void> {
    const { email, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);

    await Employee.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
  }

  /**
   * Connexion d'un compte (tout type)
   *
   * @param data - Données du compte
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async login(data: LoginDTO): Promise<LoginResult> {
    const { email, password } = data;

    const account = await AccountService.findOneByEmail(email);

    if (!account || !(await account.checkPassword(password))) {
      throw new AppError({
        statusCode: 401,
        statusText: "Unauthorized",
        message: "Email ou mot de passe incorrect.",
      });
    }

    if (account.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Votre compte est suspendu.",
      });
    }

    const accountId = account.getId();
    const role = account.role?.label ?? ACCOUNT_ROLES_LABEL.USER;
    const now = dayjs();

    return await sequelize.transaction(async (transaction) => {
      const refreshToken = await RefreshToken.create(
        {
          account_id: accountId,
          token: nanoid(),
          expires_at: now.add(ms(refreshExpiration), "ms").toDate(),
        },
        { transaction }
      );

      const accessToken = generateToken({ id: accountId, role }, accessSecret, accessExpiration);

      await account.updateLastLogin({ transaction });

      return {
        accessToken,
        refreshToken: refreshToken.token,
      };
    });
  }

  /**
   * Déconnexion d'un compte (tout type)
   *
   * @param refreshToken - Jeton de rafraîchissement
   */
  public static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.update({ revoked_at: new Date() }, { where: { token: refreshToken } });
  }

  /**
   * Génération d'un nouveau jeton d'accès
   *
   * @param refreshToken - Jeton de rafraîchissement
   * @returns Jeton d'accès (access token)
   */
  public static async refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResult> {
    const refreshTokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!refreshTokenRecord || refreshTokenRecord.isRevoked()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Token de rafraîchissement invalide.",
      });
    }

    const now = dayjs();

    if (dayjs(refreshTokenRecord.expires_at).isBefore(now)) {
      await refreshTokenRecord.update({ revoked_at: now.toDate() });

      throw new AppError({
        statusCode: 401,
        statusText: "Unauthorized",
        message: "Token de rafraîchissement expiré.",
      });
    }

    const account = await AccountService.findOneById(refreshTokenRecord.getAccountId());

    if (!account) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Compte introuvable. Le compte a peut-être été supprimé.",
      });
    }

    if (account.isSuspended()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Le compte est suspendu.",
      });
    }

    const accountId = account.getId();
    const role = account.role?.label ?? ACCOUNT_ROLES_LABEL.USER;

    const newRefreshToken = await sequelize.transaction<RefreshToken>(async (transaction) => {
      await refreshTokenRecord.update({ revoked_at: now.toDate() }, { transaction });

      return RefreshToken.create(
        {
          account_id: accountId,
          token: nanoid(),
          expires_at: now.add(ms(refreshExpiration), "ms").toDate(),
        },
        { transaction }
      );
    });

    if (!newRefreshToken) {
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message: "Erreur lors de la création du jeton de rafraîchissement.",
      });
    }

    const newAccessToken = generateToken({ id: accountId, role }, accessSecret, accessExpiration);

    return {
      accessToken: newAccessToken,
      newRefreshToken: newRefreshToken.token,
    };
  }
}

export default AuthService;
