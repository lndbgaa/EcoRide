import { sequelize } from "@/config/mysql.js";
import Account from "./Account.model.js";

const ADMIN_ROLE_ID = 1;

/**
 * Modèle représentant un administrateur de la plateforme.
 *
 * @extends Account
 */
class Admin extends Account {
  public static async findOneByEmail(email: string): Promise<Admin> {
    if (!email || typeof email !== "string") {
      throw new Error("L'email doit être une chaîne de caractères");
    }

    const admin = await this.findOneByField("email", email, {
      include: [{ association: "role" }],
    });

    if (!admin) {
      throw new Error(`Aucun compte trouvé pour l'adresse : ${email}`);
    }

    if (admin.role_id !== ADMIN_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un administrateur");
    }

    return admin;
  }

  public static async findOneByPseudo(pseudo: string): Promise<Admin> {
    if (!pseudo || typeof pseudo !== "string") {
      throw new Error("Le pseudo doit être une chaîne de caractères");
    }

    const admin = await this.findOneByField("pseudo", pseudo, {
      include: [{ association: "role" }],
    });

    if (!admin) {
      throw new Error(`Aucun compte trouvé pour le pseudo: ${pseudo}`);
    }

    if (admin.role_id !== ADMIN_ROLE_ID) {
      throw new Error("Le compte trouvé n'est pas un administrateur");
    }

    return admin;
  }
}

Admin.init(Account.defineAttributes(ADMIN_ROLE_ID), {
  sequelize,
  modelName: "Admin",
  tableName: "accounts",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

Admin.beforeValidate((admin: Admin) => {
  if (!admin.role_id) admin.role_id = ADMIN_ROLE_ID;
});

Admin.addPasswordHooks();

export default Admin;
