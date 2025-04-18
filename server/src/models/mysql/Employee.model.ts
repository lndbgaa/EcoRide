import { sequelize } from "@/config/mysql.js";
import { toDateOnly } from "@/utils/date.utils.js";
import Account, { type PrivateAccountDTO } from "./Account.model.js";

const EMPLOYEE_ROLE_ID = 2;

interface PrivateEmployeeDTO extends PrivateAccountDTO {}

/**
 * Modèle représentant un employé de la plateforme.
 *
 * @extends Account
 */
class Employee extends Account {
  toPrivateJSON(): PrivateEmployeeDTO {
    return {
      id: this.id,
      role: this.role?.label,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      pseudo: this.pseudo,
      profile_picture: this.profile_picture,
      phone: this.phone,
      address: this.address,
      birth_date: this.birth_date?.toLocaleDateString() ?? null,
      last_login: toDateOnly(this.last_login),
      member_since: this.created_at.getFullYear(),
    };
  }
}

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
