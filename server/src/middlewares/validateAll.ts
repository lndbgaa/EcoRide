import { catchAsync } from "@/utils";

import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

const validateAll = (schema: ObjectSchema, target: "body" | "params" | "query" = "body") => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target] ?? {};

    const validatedData = await schema.validateAsync(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    req[target] = validatedData;

    next();
  });
};

export { validateAll };
