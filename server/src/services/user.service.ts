import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import User from "@/models/mysql/User.model.js";

class UserService {
  public static async findOneByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères non vide.");
    }

    return await User.findOneByField("email", email, {
      where: { role_id: ACCOUNT_ROLES_ID.USER },
      include: [{ association: "role" }],
    });
  }

  public static async findOneByPseudo(pseudo: string): Promise<User | null> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères non vide.");
    }

    return await User.findOneByField("pseudo", pseudo, {
      where: { role_id: ACCOUNT_ROLES_ID.USER },
      include: [{ association: "role" }],
    });
  }
}

export default UserService;
