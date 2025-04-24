import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

import catchAsync from "@/utils/catchAsync.js";

/**
 * Middleware de validation des données entrantes via Joi
 *
 * @param schema - Schéma Joi à appliquer à la requête
 * @returns Middleware Express
 */

const validateData = (schema: ObjectSchema, target: "body" | "params" | "query" = "body") => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req[target] ?? {};

    await schema.validateAsync(data, { abortEarly: false, stripUnknown: true });
    next();
  });
};

export default validateData;
