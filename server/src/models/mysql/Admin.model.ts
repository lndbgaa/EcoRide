import { sequelize } from "@/config/mysql.config.js";
import { ACCOUNT_ROLES_ID } from "@/constants/index.js";
import Account from "@/models/mysql/Account.model.js";

/**
 * Modèle représentant un administrateur de la plateforme.
 *
 * @extends Account
 */
class Admin extends Account {}

Admin.init(Account.defineAttributes(ACCOUNT_ROLES_ID.ADMIN), {
  sequelize,
  modelName: "Admin",
  tableName: "accounts",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  defaultScope: {
    where: {
      role_id: ACCOUNT_ROLES_ID.ADMIN,
    },
  },
});

Admin.beforeValidate((admin: Admin) => {
  admin.role_id = ACCOUNT_ROLES_ID.ADMIN;
});

Admin.addAccountHooks();

export default Admin;
