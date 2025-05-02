import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

import type { NextFunction, Request, Response } from "express";

/**
 * Fonction de nettoyage des chaînes de caractères dans des objets
 * @param obj - L'objet à nettoyer
 * @returns L'objet nettoyé
 */
function sanitizeInput(obj: any): any {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeInput(obj[key]);
    }
  }
  return obj;
}

/**
 * Middleware de nettoyage des données entrantes
 */
export default function sanitizeAll(req: Request, res: Response, next: NextFunction) {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);

  mongoSanitize()(req, res, next);
}
