export interface User {
  id: string;
  email: string;
  pseudo: string;
  firstName: string;
  lastName: string;
  isDriver: boolean;
  isPassenger: boolean;
  address: string | null;
  phone: string | null;
  birthDate: string | null;
  avatar: string | null;
  averageRating: number | null;
  credits: number;
  memberSince: string;
  lastLogin: string;
}

export interface UpdateUserInfo {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}
