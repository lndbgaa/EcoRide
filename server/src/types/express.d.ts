import type { Request } from "express";
import type { JwtPayload } from "./index.js";

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
