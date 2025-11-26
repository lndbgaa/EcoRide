import type { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

// ===========================
//       Request Payload
// =========================== */

export interface RegisterUserPayload {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ===========================
//       Response Types
// =========================== */

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
