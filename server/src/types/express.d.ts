import type { JwtPayload } from "@/types/jwt"; // ou remplace par { id: string; role: string }
import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
