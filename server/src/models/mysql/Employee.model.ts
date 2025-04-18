import { sequelize } from "@/config/mysql.js";
import Account from "./Account.model.js";

const EMPLOYEE_ROLE_ID = 2;

/**
 * Modèle représentant un employé de la plateforme.
 *
 * @extends Account
 */
class Employee extends Account {}

Employee.init(Account.defineAttributes(EMPLOYEE_ROLE_ID), {
  sequelize,
  modelName: "Employee",
  tableName: "accounts",
  timestamps: true,
  underscored: true,
});

Account.addPasswordHooks(Employee);

Employee.beforeValidate((employee: Employee) => {
  if (!employee.role_id) employee.role_id = EMPLOYEE_ROLE_ID;
});

export default Employee;
