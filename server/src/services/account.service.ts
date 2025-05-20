import { Admin, Employee, User } from "@/models/mysql/index.js";

type Account = User | Admin | Employee;

class AccountService {
  public static async getAllAccounts(): Promise<Account[]> {
    const [users, employees, admins] = await Promise.all([
      User.findAll({ include: [{ association: "role" }] }),
      Employee.findAll({ include: [{ association: "role" }] }),
      Admin.findAll({ include: [{ association: "role" }] }),
    ]);

    return [...users, ...employees, ...admins];
  }

  public static async doesEmailExist(email: string): Promise<boolean> {
    const [user, admin, employee] = await Promise.all([
      User.findOne({ where: { email } }),
      Admin.findOne({ where: { email } }),
      Employee.findOne({ where: { email } }),
    ]);

    return !!(user ?? admin ?? employee);
  }

  public static async doesPseudoExist(pseudo: string): Promise<boolean> {
    const [user, admin, employee] = await Promise.all([
      User.findOne({ where: { pseudo } }),
      Admin.findOne({ where: { pseudo } }),
      Employee.findOne({ where: { pseudo } }),
    ]);

    return !!(user ?? admin ?? employee);
  }

  public static async findOneByEmail(email: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOne({ where: { email }, include: [{ association: "role" }] }),
      Admin.findOne({ where: { email }, include: [{ association: "role" }] }),
      Employee.findOne({ where: { email }, include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }

  public static async findOneByPseudo(pseudo: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOne({ where: { pseudo }, include: [{ association: "role" }] }),
      Admin.findOne({ where: { pseudo }, include: [{ association: "role" }] }),
      Employee.findOne({ where: { pseudo }, include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }

  public static async findOneById(id: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOne({ where: { id }, include: [{ association: "role" }] }),
      Admin.findOne({ where: { id }, include: [{ association: "role" }] }),
      Employee.findOne({ where: { id }, include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }
}

export default AccountService;
