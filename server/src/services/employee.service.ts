import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import Employee from "@/models/mysql/Employee.model.js";

class EmployeeService {
  public static async findOneByEmail(email: string): Promise<Employee | null> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    return await Employee.findOneByField("email", email, {
      where: { role_id: ACCOUNT_ROLES_ID.EMPLOYEE },
      include: [{ association: "role" }],
    });
  }

  public static async findOneByPseudo(pseudo: string): Promise<Employee | null> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères");
    }

    return await Employee.findOneByField("pseudo", pseudo, {
      where: { role_id: ACCOUNT_ROLES_ID.EMPLOYEE },
      include: [{ association: "role" }],
    });
  }
}

export default EmployeeService;
