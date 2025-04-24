import ms from "ms";
import { nanoid } from "nanoid";

import config from "@/config/app.config.js";
import { sequelize } from "@/config/mysql.config.js";
import { Employee, RefreshToken, User } from "@/models/mysql/index.js";
import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";
import { generateToken } from "@/utils/jwt.utils.js";

type AccountModel = typeof User | typeof Employee;

type AccountRole = "user" | "employee";

type RegisterData = {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
};

type RegisterResponse = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  expiresIn: number | null;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
};

type RefreshAccessTokenResponse = {
  accessToken: string;
  expiresAt: number;
  expiresIn: number;
};

const { access_secret, access_expiration, refresh_expiration } = config.jwt;

class AuthService {
  /**
   * Création d'un compte (utilisateur ou employé)
   *
   * @param model - Modèle de compte à enregistrer
   * @param role - Rôle du compte
   * @param data - Données du compte
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async register(
    model: AccountModel,
    role: AccountRole,
    data: RegisterData
  ): Promise<RegisterResponse> {
    const { email, pseudo, password, firstName, lastName } = data;

    const emailExists = await AccountService.doesEmailExist(email);

    if (emailExists) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Un compte avec cet email existe déjà.",
      });
    }

    const pseudoExists = await AccountService.doesPseudoExist(pseudo);

    if (pseudoExists) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Le pseudo est déjà pris.",
      });
    }

    // Un compte employé est créer par un admin = pas de refresh token à l'inscription
    if (role === "employee") {
      await model.createOne({
        email,
        pseudo,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      return { accessToken: null, refreshToken: null, expiresIn: null, expiresAt: null };
    }

    // Un compte ne peut pas être créer dans la BDD sans un refresh token et inversement = transaction
    return await sequelize.transaction(async (transaction) => {
      const account = await model.createOne(
        {
          email,
          pseudo,
          password,
          first_name: firstName,
          last_name: lastName,
        },
        { transaction }
      );

      const refreshToken = await RefreshToken.createOne(
        {
          account_id: account.id,
          token: nanoid(),
          expires_at: new Date(Date.now() + ms(refresh_expiration)),
        },
        { transaction }
      );

      const accessToken = generateToken({ id: account.id, role }, access_secret, access_expiration);

      return {
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: ms(access_expiration),
        expiresAt: Date.now() + ms(access_expiration),
      };
    });
  }

  /**
   * Connexion d'un compte (utilisateur, employé, administrateur)
   *
   * @param email - Email du compte
   * @param password - Mot de passe du compte
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async login(email: string, password: string): Promise<LoginResponse> {
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
        message: "Le compte est suspendu.",
      });
    }

    const role = account.role?.label ?? "user";

    return await sequelize.transaction(async (transaction) => {
      await account.updateLastLogin();

      await RefreshToken.deleteHardByField("account_id", account.id, {
        transaction,
      });

      const refreshToken = await RefreshToken.createOne(
        {
          account_id: account.id,
          token: nanoid(),
          expires_at: new Date(Date.now() + ms(refresh_expiration)),
        },
        { transaction }
      );

      const accessToken = generateToken({ id: account.id, role }, access_secret, access_expiration);

      return {
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: ms(access_expiration),
        expiresAt: Date.now() + ms(access_expiration),
      };
    });
  }

  /**
   * Déconnexion d'un compte (utilisateur, employé, administrateur)
   *
   * @param refreshToken - Jeton de rafraîchissement (refresh token)
   */
  public static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.deleteHardByField("token", refreshToken);
  }

  /**
   * Génération d'un nouveau jeton d'accès (access token)
   *
   * @param refreshToken - Jeton de rafraîchissement (refresh token)
   * @returns Jeton d'accès (access token)
   */
  public static async refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshAccessTokenResponse> {
    const tokenRecord = await RefreshToken.findOneByField("token", refreshToken);

    if (!tokenRecord) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Token de rafraîchissement invalide. L'utilisateur n'est pas connecté.",
      });
    }

    if (tokenRecord.expires_at < new Date()) {
      await RefreshToken.deleteHardByField("token", refreshToken);

      throw new AppError({
        statusCode: 401,
        statusText: "Unauthorized",
        message: "Token de rafraîchissement expiré. L'utilisateur doit se reconnecter.",
      });
    }

    const account = await AccountService.findOneById(tokenRecord.account_id);

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

    const newAccessToken = generateToken(
      { id: account.id, role: account.role?.label ?? "user" },
      access_secret,
      access_expiration
    );

    return {
      accessToken: newAccessToken,
      expiresIn: ms(access_expiration),
      expiresAt: Date.now() + ms(access_expiration),
    };
  }
}

export default AuthService;
