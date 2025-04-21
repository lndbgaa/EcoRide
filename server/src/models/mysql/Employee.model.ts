import { sequelize } from "@/config/mysql.js";
import Account from "./Account.model.js";

const EMPLOYEE_ROLE_ID = 2;

/**
 * Modèle représentant un employé de la plateforme.
 *
 * @extends Account
 */
class Employee extends Account {
  public static async findOneByEmail(email: string): Promise<Employee> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    const employee = await this.findOneByField("email", email, {
      include: [{ association: "role" }],
    });

    if (!employee) {
      throw new Error(`Aucun compte trouvé pour l'adresse : ${email}`);
    }

    if (employee.role_id !== EMPLOYEE_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un employé");
    }

    return employee;
  }

  public static async findOneByPseudo(pseudo: string): Promise<Employee> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères");
    }

    const employee = await this.findOneByField("pseudo", pseudo, {
      include: [{ association: "role" }],
    });

    if (!employee) {
      throw new Error(`Aucun compte trouvé pour le pseudo: ${pseudo}`);
    }

    if (employee.role_id !== EMPLOYEE_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un employé");
    }

    return employee;
  }
}

Employee.init(Account.defineAttributes(EMPLOYEE_ROLE_ID), {
  sequelize,
  modelName: "Employee",
  tableName: "accounts",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

Employee.beforeValidate((employee: Employee) => {
  if (!employee.role_id) employee.role_id = EMPLOYEE_ROLE_ID;
});

Employee.addPasswordHooks();

export default Employee;
