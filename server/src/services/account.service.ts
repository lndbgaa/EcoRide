import Admin from "@/models/mysql/Admin.model.js";
import Employee from "@/models/mysql/Employee.model.js";
import User from "@/models/mysql/User.model.js";

class AccountService {
  /**
   * Vérifie si un email existe déjà dans n'importe quel type de compte
   */
  public static async isEmailTaken(email: string): Promise<boolean> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("email", email),
      Admin.findOneByField("email", email),
      Employee.findOneByField("email", email),
    ]);

    return !!(user || admin || employee);
  }

  /**
   * Vérifie si un pseudo existe déjà dans n'importe quel type de compte
   */
  public static async isPseudoTaken(pseudo: string): Promise<boolean> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères non vide.");
    }

    const [user, admin, employee] = await Promise.all([
      User.findOneByField("pseudo", pseudo),
      Admin.findOneByField("pseudo", pseudo),
      Employee.findOneByField("pseudo", pseudo),
    ]);

    return !!(user || admin || employee);
  }
}

export default AccountService;
