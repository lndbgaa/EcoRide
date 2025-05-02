import jwt from "jsonwebtoken";

import AppError from "@/utils/AppError.js";

import type { AccountRoleLabel } from "@/types/index.js";
import type { StringValue } from "ms";

interface JwtPayload {
  id: string;
  role: AccountRoleLabel;
}

/**
 * Génère un token JWT pour un compte
 *
 * @param payload - Données à inclure dans le token
 * @param secret - Clé secrète
 * @param expiresIn - Durée de validité du token
 * @returns Token JWT
 */
export function generateToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: StringValue | number
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Vérifie un token JWT
 *
 * @param token - Token JWT
 * @param secret - Clé secrète
 * @returns Données du token
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    throw new AppError({
      statusCode: 401,
      statusText: "Unauthorized",
      message: "Token invalide ou expiré",
    });
  }
}
