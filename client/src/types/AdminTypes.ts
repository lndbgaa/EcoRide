export type Admin = {
  role: "admin";
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  memberSince: string | null;
};
