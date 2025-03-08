import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
/**
 * Error handler middleware
 *
 * This middleware is responsible to catch the errors from any request handler
 * wrapped inside the asyncHandler
 */
declare const errorHandler: (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export { errorHandler };
