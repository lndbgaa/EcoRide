import { sequelize } from "@/config/mysql.js";
import bcrypt from "bcrypt";
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

Employee.beforeValidate((employee: Employee) => {
  if (!employee.role_id) employee.role_id = EMPLOYEE_ROLE_ID;
});

Employee.beforeCreate(async (account: Account) => {
  const salt = await bcrypt.genSalt(10);
  account.password = await bcrypt.hash(account.password, salt);
});

Employee.beforeUpdate(async (account: Account) => {
  if (account.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(account.password, salt);
  }
});

export default Employee;
