import type { CustomJwtPayload } from "@/types";

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

export {};
