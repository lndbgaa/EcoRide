export type Employee = {
  role: "employee";
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  memberSince: string | null;
};

export type CreateEmployee = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
