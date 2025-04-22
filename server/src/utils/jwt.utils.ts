import { JWT_CONFIG } from "@/constants/index.js";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Génère un token JWT pour un compte
 *
 * @param payload - Données à inclure dans le token
 * @returns Token JWT
 */
export function generateToken<T extends JwtPayload>(payload: T): string {
  return jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
}
