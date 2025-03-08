import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async request handler to automatically catch errors and forward them to the next middleware
 * @param requestHandler The async handler function to wrap
 */
const asyncHandler = (
  requestHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
