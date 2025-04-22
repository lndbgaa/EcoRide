import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import Admin from "@/models/mysql/Admin.model.js";

class AdminService {
  public static async findOneByEmail(email: string): Promise<Admin | null> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    return await Admin.findOneByField("email", email, {
      where: { role_id: ACCOUNT_ROLES_ID.ADMIN },
      include: [{ association: "role" }],
    });
  }

  public static async findOneByPseudo(pseudo: string): Promise<Admin | null> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères");
    }

    return await Admin.findOneByField("pseudo", pseudo, {
      where: { role_id: ACCOUNT_ROLES_ID.ADMIN },
      include: [{ association: "role" }],
    });
  }
}

export default AdminService;
