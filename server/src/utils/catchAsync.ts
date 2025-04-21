import type { NextFunction, Request, Response } from "express";

/**
 * Permet de facilement capturer les erreurs asynchrones
 */
function catchAsync(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export default catchAsync;
