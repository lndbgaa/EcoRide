import { catchAsync } from "@/utils";

import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

const validateAll = (schema: ObjectSchema, target: "body" | "params" | "query" = "body") => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req[target] ?? {};
    await schema.validateAsync(data, { abortEarly: false, stripUnknown: true });
    next();
  });
};

export { validateAll };
