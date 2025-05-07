import { JwtPayload } from "jwt-decode";

export interface RegisterData {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}
