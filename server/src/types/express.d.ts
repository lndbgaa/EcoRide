import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
