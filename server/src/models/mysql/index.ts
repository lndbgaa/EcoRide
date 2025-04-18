import Admin from "./Admin.model.js";
import Employee from "./Employee.model.js";
import Role from "./Role.model.js";
import User from "./User.model.js";

// === Associations ===

// Chaque type de compte (User, Admin, Employee) est lié à un rôle
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Admin.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Employee.belongsTo(Role, { foreignKey: "role_id", as: "role" });

export { Admin, Employee, Role, User };
