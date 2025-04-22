import { Admin, Employee, User } from "@/models/mysql/index.js";

type Account = User | Admin | Employee;

class AccountService {
  /**
   * Vérifie si un email existe déjà dans n'importe quel type de compte
   *
   * 💡 Utile pour l'inscription
   */
  public static async doesEmailExist(email: string): Promise<boolean> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("email", email),
      Admin.findOneByField("email", email),
      Employee.findOneByField("email", email),
    ]);

    return !!(user ?? admin ?? employee);
  }

  /**
   * Vérifie si un pseudo existe déjà dans n'importe quel type de compte
   *
   * 💡 Utile pour l'inscription
   */
  public static async doesPseudoExist(pseudo: string): Promise<boolean> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("pseudo", pseudo),
      Admin.findOneByField("pseudo", pseudo),
      Employee.findOneByField("pseudo", pseudo),
    ]);

    return !!(user ?? admin ?? employee);
  }

  /**
   * Trouve un compte par email
   *
   * 💡 Utile pour la connexion
   */
  public static async findOneByEmail(email: string): Promise<Account | null> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("email", email, { include: [{ association: "role" }] }),
      Admin.findOneByField("email", email, { include: [{ association: "role" }] }),
      Employee.findOneByField("email", email, { include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }

  /**
   * Trouve un compte par pseudo
   *
   */
  public static async findOneByPseudo(pseudo: string): Promise<Account | null> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
      Admin.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
      Employee.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }
}

export default AccountService;
