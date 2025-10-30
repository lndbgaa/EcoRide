import xss from "xss";

import type { NextFunction, Request, Response } from "express";

function sanitizeInput(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInput(obj[key]);
    }
  });

  return obj;
}

function sanitizeMongo(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  Object.keys(obj).forEach((key) => {
    if (key.includes("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeMongo(obj[key]);
    }
  });

  return obj;
}

function sanitizeAll(req: Request, res: Response, next: NextFunction): void {
  [req.body, req.query, req.params].forEach((obj) => {
    if (obj) {
      sanitizeInput(obj);
      sanitizeMongo(obj);
    }
  });

  next();
}

export { sanitizeAll };
