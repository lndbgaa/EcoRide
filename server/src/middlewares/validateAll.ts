import catchAsync from "@/utils/catchAsync.js";

import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

/**
 * Fonction de validation des données entrantes via Joi
 *
 * @param schema - Schéma Joi à appliquer à la requête
 * @param target - Cible de la validation (body, params, query)
 * @returns Middleware Express
 */
const validateAll = (
  schema: ObjectSchema,
  target: "body" | "params" | "query" = "body"
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req[target] ?? {};
    await schema.validateAsync(data, { abortEarly: false, stripUnknown: true });
    next();
  });
};

export default validateAll;
