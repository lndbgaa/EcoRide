import config from "@/config/app.config.js";
import { Admin, Employee, RefreshToken, User } from "@/models/mysql/index.js";
import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";
import { generateToken } from "@/utils/jwt.utils.js";

type AccountType = typeof User | typeof Admin | typeof Employee;

type RegisterData = {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
};

class AuthService {
  /**
   * Création d'un compte (user, admin, employee)
   *
   * @param model - Modèle de compte à enregistrer (User, Employee)
   * @param role - Rôle du compte (user, employee)
   * @param data - Données du compte (email, pseudo, password, firstName, lastName)
   * @returns JWT du compte
   */
  public static async register(model: AccountType, role: string, data: RegisterData) {
    const { email, pseudo, password, firstName, lastName } = data;

    const emailExists = await AccountService.doesEmailExist(email);

    if (emailExists) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Un compte avec cet email existe déjà.",
      });
    }

    const pseudoExists = await AccountService.doesPseudoExist(pseudo);

    if (pseudoExists) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le pseudo est déjà pris.",
      });
    }

    const newAccount = await model.createOne({
      email,
      pseudo,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    await RefreshToken.createOne({
      account_id: newAccount.id,
      token: generateToken({ id: newAccount.id, role }, config.server.jwt_refresh_secret, "7d"),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });

    const accessToken = generateToken({ id: newAccount.id, role }, config.server.jwt_secret, "1h");

    return { accessToken };
  }

  /**
   * Connexion d'un compte (user, admin, employee)
   *
   * @param email - Email du compte
   * @param password - Mot de passe du compte
   * @returns JWT du compte
   */
  public static async login(email: string, password: string) {
    const account = await AccountService.findOneByEmail(email);

    if (!account || !(await account.checkPassword(password))) {
      throw new AppError({
        statusCode: 401,
        statusText: "Unauthorized",
        message: "Email ou mot de passe incorrect.",
      });
    }

    await RefreshToken.createOne({
      account_id: account.id,
      token: generateToken(
        { id: account.id, role: account.role?.label ?? "user" },
        config.server.jwt_refresh_secret,
        "7d"
      ),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });

    const accessToken = generateToken(
      { id: account.id, role: account.role?.label ?? "user" },
      config.server.jwt_secret,
      "1h"
    );

    return { accessToken };
  }

  /**
   * Déconnexion d'un utilisateur
   *
   * =Détruit le jeton de rafraîchissement
   *
   * @param account_id - ID du compte
   */
  public static async logout(account_id: string) {
    await RefreshToken.deleteHardByField("account_id", account_id);
  }
}

export default AuthService;
