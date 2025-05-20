import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import Account from "@/models/mysql/Account.model.js";
import { getAge, toDateOnly } from "@/utils/date.utils.js";

export interface EmployeePrivateDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  age: number | null;
  memberSince: string | null;
}

export interface EmployeeAdminDTO {
  role: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Modèle représentant un employé de la plateforme.
 *
 * @extends Account
 */
class Employee extends Account {
  toPrivateDTO(): EmployeePrivateDTO {
    return {
      id: this.id,
      email: this.email,
      firstName: this.first_name,
      lastName: this.last_name,
      phone: this.phone ?? null,
      address: this.address ?? null,
      birthDate: this.birth_date ? toDateOnly(this.birth_date) : null,
      age: this.birth_date ? getAge(this.birth_date) : null,
      memberSince: this.created_at ? toDateOnly(this.created_at) : null,
    };
  }

  toAdminDTO(): EmployeeAdminDTO {
    return {
      role: this.role?.label ?? "Employee",
      id: this.id,
      firstName: this.first_name,
      lastName: this.last_name,
      email: this.email,
    };
  }
}

Employee.init(Account.defineAttributes(ACCOUNT_ROLES_ID.EMPLOYEE), {
  sequelize,
  modelName: "Employee",
  tableName: "accounts",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  defaultScope: {
    where: {
      role_id: ACCOUNT_ROLES_ID.EMPLOYEE,
    },
  },
});

Employee.beforeValidate((employee: Employee) => {
  employee.role_id = ACCOUNT_ROLES_ID.EMPLOYEE;
});

Employee.addAccountHooks();

export default Employee;
