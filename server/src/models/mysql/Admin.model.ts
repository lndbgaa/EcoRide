import { sequelize } from "@/config/mysql.js";
import bcrypt from "bcrypt";
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

Admin.beforeValidate((admin: Admin) => {
  if (!admin.role_id) admin.role_id = ADMIN_ROLE_ID;
});

Admin.beforeCreate(async (account: Account) => {
  const salt = await bcrypt.genSalt(10);
  account.password = await bcrypt.hash(account.password, salt);
});

Admin.beforeUpdate(async (account: Account) => {
  if (account.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(account.password, salt);
  }
});

export default Admin;
