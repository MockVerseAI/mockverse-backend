import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import logger from "../logger/winston.logger.js";

/**
 * Error handler middleware
 *
 * This middleware is responsible for catching errors from any request handler wrapped
 * inside the asyncHandler. It provides a consistent error response format.
 *
 * @param err The error object
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(err instanceof ApiError)) {
    // If not, create a new ApiError instance to keep the consistency

    // Assign an appropriate status code
    const statusCode =
      "statusCode" in err
        ? (err.statusCode as number)
        : err instanceof mongoose.Error
          ? 400
          : 500;

    // Set a message from native Error instance or a default message
    const message = err.message || "Something went wrong";

    // Create a new ApiError with the error details
    error = new ApiError(
      statusCode,
      message,
      "errors" in err && Array.isArray(err.errors) ? err.errors : [],
      err.stack
    );
  } else {
    error = err;
  }

  // Prepare the response object
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    logger.error(error);
  }

  // Send error response
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
