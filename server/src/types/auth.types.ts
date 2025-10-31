import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export interface RegisterUserPayload {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
