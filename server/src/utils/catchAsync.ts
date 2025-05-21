import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Permet de facilement capturer les erreurs asynchrones
 */
function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export default catchAsync;
