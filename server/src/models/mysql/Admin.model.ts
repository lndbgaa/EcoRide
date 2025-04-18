import { sequelize } from "@/config/mysql.js";
import Account from "./Account.model.js";

const ADMIN_ROLE_ID = 1;

/**
 * Modèle représentant un administrateur de la plateforme.
 *
 * @extends Account
 */
class Admin extends Account {}

Admin.init(Account.defineAttributes(ADMIN_ROLE_ID), {
  sequelize,
  modelName: "Admin",
  tableName: "accounts",
  timestamps: true,
  underscored: true,
});

Account.addPasswordHooks(Admin);

Admin.beforeValidate((admin: Admin) => {
  if (!admin.role_id) admin.role_id = ADMIN_ROLE_ID;
});

export default Admin;
