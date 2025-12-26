import type { User } from "@/models/mysql";
import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
