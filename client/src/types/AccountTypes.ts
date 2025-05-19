import type { Admin } from "./AdminTypes";
import type { Employee } from "./EmployeeTypes";
import type { User } from "./UserTypes";

export type Account = User | Employee | Admin;
