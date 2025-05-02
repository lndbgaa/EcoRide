import ms from "ms";
import { nanoid } from "nanoid";

import config from "@/config/app.config.js";
import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_LABEL } from "@/constants/index.js";
import { Employee, RefreshToken, User } from "@/models/mysql";
import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";
import { generateToken } from "@/utils/jwt.utils.js";

type RegisterUserData = {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
};

type RegisterUserResponse = {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
};

type RegisterEmployeeData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type LoginData = {
  email: string;
  password: string;
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
   * Création d'un compte (utilisateur)
   *
   * @param data - Données du compte (email, pseudo, mot de passe, prénom, nom)
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async registerUser(
    data: RegisterUserData
  ): Promise<RegisterUserResponse> {
    const { email, pseudo, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);
    await this.assertPseudoIsUnique(pseudo);

    // Après inscription, l'utilisateur est connecté.
    // -> Le compte ne peut pas être créé dans la BDD sans un refresh token et inversement = transaction
    return await sequelize.transaction(async (transaction) => {
      const now = Date.now();

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

      const refreshToken = await RefreshToken.create(
        {
          account_id: newUser.id,
          token: nanoid(),
          expires_at: new Date(now + ms(refresh_expiration)),
        },
        { transaction }
      );

      const accessToken: string = generateToken(
        { id: newUser.id, role: ACCOUNT_ROLES_LABEL.USER },
        access_secret,
        access_expiration
      );

      return {
        accountId: newUser.id,
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: ms(access_expiration),
        expiresAt: now + ms(access_expiration),
      };
    });
  }

  /**
   * Création d'un compte (employé)
   *
   * @param data - Données du compte (email, pseudo, mot de passe, prénom, nom)
   * @returns ID du compte
   */
  public static async registerEmployee(
    data: RegisterEmployeeData
  ): Promise<{ accountId: string }> {
    const { email, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);

    // Un compte employé est créé par un administrateur.
    // -> Pas de connexion automatique : pas de jetons d'accès ni de rafraîchissement.
    const newEmployee: Employee = await Employee.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    return {
      accountId: newEmployee.id,
    };
  }

  /**
   * Connexion d'un compte (utilisateur, employé, administrateur)
   *
   * @param data - Données du compte (email, mot de passe)
   * @returns Jeton d'accès (access token) et de rafraîchissement (refresh token)
   */
  public static async login(data: LoginData): Promise<LoginResponse> {
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
        message: "Le compte est suspendu.",
      });
    }

    const role = account.role?.label ?? ACCOUNT_ROLES_LABEL.USER;
    const now = Date.now();

    await RefreshToken.destroy({ where: { account_id: account.id } });

    const refreshToken = await RefreshToken.create({
      account_id: account.id,
      token: nanoid(),
      expires_at: new Date(now + ms(refresh_expiration)),
    });

    const accessToken = generateToken(
      { id: account.id, role },
      access_secret,
      access_expiration
    );

    await account.updateLastLogin();

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: ms(access_expiration),
      expiresAt: now + ms(access_expiration),
    };
  }

  /**
   * Déconnexion d'un compte (utilisateur, employé, administrateur)
   *
   * @param refreshToken - Jeton de rafraîchissement (refresh token)
   */
  public static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.destroy({ where: { token: refreshToken } });
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
    const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!tokenRecord) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Token de rafraîchissement invalide. L'utilisateur n'est pas connecté.",
      });
    }

    if (tokenRecord.expires_at < new Date()) {
      await RefreshToken.destroy({ where: { token: refreshToken } });

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

    const role = account.role?.label ?? ACCOUNT_ROLES_LABEL.USER;
    const now = Date.now();

    const newAccessToken = generateToken(
      { id: account.id, role },
      access_secret,
      access_expiration
    );

    return {
      accessToken: newAccessToken,
      expiresIn: ms(access_expiration),
      expiresAt: now + ms(access_expiration),
    };
  }
}

export default AuthService;
