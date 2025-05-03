import xss from "xss";

import type { NextFunction, Request, Response } from "express";

/**
 * Fonction de nettoyage des objets contre les injections XSS
 * @param obj - L'objet à nettoyer
 * @returns L'objet nettoyé
 */
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

/**
 * Fonction de nettoyage des objets contre les injections NoSQL (MongoDB)
 * @returns L'objet nettoyé
 */
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

/**
 * Middleware de nettoyage des données entrantes
 */
export default function sanitizeAll(req: Request, res: Response, next: NextFunction) {
  [req.body, req.query, req.params].forEach((obj) => {
    if (obj) {
      sanitizeInput(obj);
      sanitizeMongo(obj);
    }
  });
  next();
}
