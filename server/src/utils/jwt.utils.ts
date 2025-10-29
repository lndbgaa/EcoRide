import jwt from "jsonwebtoken";

import { DEBUG_CODES, ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import { AppError } from "@/utils";

import type { CustomJwtPayload } from "@/types";
import type { StringValue } from "ms";

const { TokenExpiredError, JsonWebTokenError } = jwt;

export function generateJwt(
  payload: CustomJwtPayload,
  secret: string,
  expiresIn: StringValue | number
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function validateJwt(token: string, secret: string): CustomJwtPayload {
  let decoded: unknown;

  try {
    decoded = jwt.verify(token, secret);
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: `Token has expired at ${err.expiredAt.toISOString()}`,
        code: ERROR_CODES.AUTH.ACCESS_TOKEN_EXPIRED,
        debugCode: DEBUG_CODES.AUTH.ACCESS_TOKEN_EXPIRED,
      });
    }

    if (err instanceof JsonWebTokenError) {
      throw new AppError({
        statusCode: 401,
        userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
        debugMessage: `JWT validation failed: ${err.message}`,
        code: ERROR_CODES.AUTH.ACCESS_TOKEN_INVALID,
        debugCode: DEBUG_CODES.AUTH.ACCESS_TOKEN_INVALID,
      });
    }

    throw new AppError({
      statusCode: 500,
      userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
      debugMessage: `Unexpected JWT validation error: ${err instanceof Error ? err.message : String(err)}`,
      code: ERROR_CODES.AUTH.ACCESS_TOKEN_INVALID,
      debugCode: DEBUG_CODES.AUTH.ACCESS_TOKEN_UNEXPECTED_ERROR,
    });
  }

  if (!decoded || typeof decoded !== "object" || !("id" in decoded) || !("role" in decoded)) {
    throw new AppError({
      statusCode: 401,
      userMessage: ERROR_MESSAGES.AUTH.SESSION_INVALID,
      debugMessage: "Token payload missing required fields (id, role)",
      code: ERROR_CODES.AUTH.ACCESS_TOKEN_MALFORMED,
      debugCode: DEBUG_CODES.AUTH.ACCESS_TOKEN_MALFORMED,
    });
  }

  return decoded as CustomJwtPayload;
}
