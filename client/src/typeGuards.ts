import type { Account } from "@/types/AccountTypes";
import type { Admin } from "@/types/AdminTypes";
import type { Employee } from "@/types/EmployeeTypes";
import type { User } from "@/types/UserTypes";

export function isUser(account: Account): account is User {
  return account.role === "user";
}

export function isAdmin(account: Account): account is Admin {
  return account.role === "admin";
}

export function isEmployee(account: Account): account is Employee {
  return account.role === "employee";
}

export function isStaff(account: Account): account is Admin | Employee {
  return ["admin", "employee"].includes(account.role);
}
