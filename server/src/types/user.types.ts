export type UserInfo = {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  birthDate?: Date;
  phone?: string;
  address?: string;
};

export type UserRole = "driver" | "passenger";
