import { Admin, Employee, User } from "@/models/mysql/index.js";

type Account = User | Admin | Employee;

class AccountService {
  public static async doesEmailExist(email: string): Promise<boolean> {
    const [user, admin, employee] = await Promise.all([
      User.findOneByField("email", email),
      Admin.findOneByField("email", email),
      Employee.findOneByField("email", email),
    ]);

    return !!(user ?? admin ?? employee);
  }

  public static async doesPseudoExist(pseudo: string): Promise<boolean> {
    const [user, admin, employee] = await Promise.all([
      User.findOneByField("pseudo", pseudo),
      Admin.findOneByField("pseudo", pseudo),
      Employee.findOneByField("pseudo", pseudo),
    ]);

    return !!(user ?? admin ?? employee);
  }

  public static async findOneByEmail(email: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOneByField("email", email, { include: [{ association: "role" }] }),
      Admin.findOneByField("email", email, { include: [{ association: "role" }] }),
      Employee.findOneByField("email", email, { include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }

  public static async findOneByPseudo(pseudo: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
      Admin.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
      Employee.findOneByField("pseudo", pseudo, { include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }

  public static async findOneById(id: string): Promise<Account | null> {
    const [user, admin, employee] = await Promise.all([
      User.findOneByField("id", id, { include: [{ association: "role" }] }),
      Admin.findOneByField("id", id, { include: [{ association: "role" }] }),
      Employee.findOneByField("id", id, { include: [{ association: "role" }] }),
    ]);

    return user ?? admin ?? employee;
  }
}

export default AccountService;
