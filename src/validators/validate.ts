import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Validate middleware for express-validator
 *
 * This is the validate middleware responsible for centralizing the error checking done by the
 * express-validator ValidationChains. This checks if the request validation has errors.
 * If yes, then it structures them and throws an ApiError which forwards the error to the
 * errorHandler middleware which throws a uniform response at a single place.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: Record<string, string>[] = [];

  errors.array().map((err) => {
    if ("path" in err) {
      extractedErrors.push({ [err.path]: err.msg as string });
    }
  });

  // 422: Unprocessable Entity
  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
