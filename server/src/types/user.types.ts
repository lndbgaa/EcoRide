export type UserRole = "driver" | "passenger";

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  birthDate?: Date;
  phone?: string;
  address?: string;
};
