import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import { getAge } from "@/utils/date.utils.js";
import Account from "./Account.model.js";

interface EmployeePrivateDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  birthDate: Date | null;
  age: string | null;
  profilePicture: string | null;
  memberSince: number | null;
}

/**
 * Modèle représentant un employé de la plateforme.
 *
 * @extends Account
 */
class Employee extends Account {
  /**
   * Retourne les informations privées d'un employé'.
   *
   * 💡 Utile lorsque l'employé lui-même consulte son profil.
   */
  toPrivateJSON(): EmployeePrivateDTO {
    return {
      id: this.id,
      email: this.email,
      firstName: this.first_name,
      lastName: this.last_name,
      phone: this.phone ?? null,
      address: this.address ?? null,
      birthDate: this.birth_date ?? null,
      age: this.birth_date ? getAge(this.birth_date) : null,
      profilePicture: this.profile_picture ?? null,
      memberSince: this.created_at?.getFullYear() ?? null,
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
  if (!employee.role_id) employee.role_id = ACCOUNT_ROLES_ID.EMPLOYEE;
});

Employee.addPasswordHooks();

export default Employee;
