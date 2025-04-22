import catchAsync from "@/utils/catchAsync.js";
import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

/**
 * Middleware de validation des données entrantes via Joi.
 *
 * @param schema - Schéma Joi à appliquer à la requête
 * @returns Middleware Express
 */

const validate = (schema: ObjectSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    next();
  });
};

export default validate;
