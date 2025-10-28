import jwt from "jsonwebtoken";

import type { CustomJwtPayload } from "@/types";
import type { StringValue } from "ms";

export function generateJwt(payload: CustomJwtPayload, secret: string, expiresIn: StringValue | number): string {
  return jwt.sign(payload, secret, { expiresIn });
}
