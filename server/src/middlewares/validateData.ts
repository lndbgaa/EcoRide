import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

import catchAsync from "@/utils/catchAsync.js";

/**
 * Middleware de validation des données entrantes via Joi
 *
 * @param schema - Schéma Joi à appliquer à la requête
 * @returns Middleware Express
 */

const validateData = (schema: ObjectSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    next();
  });
};

export default validateData;
