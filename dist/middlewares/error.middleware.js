import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
/**
 * Error handler middleware
 *
 * This middleware is responsible to catch the errors from any request handler
 * wrapped inside the asyncHandler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error;
    // Check if the error is an instance of an ApiError class which extends native Error class
    if (!(err instanceof ApiError)) {
        // If not, create a new ApiError instance to keep the consistency
        // Assign an appropriate status code
        const statusCode = err instanceof mongoose.Error.ValidationError
            ? 400
            : err instanceof mongoose.Error.CastError
                ? 400
                : 500;
        // Set a message from native Error instance or a custom message
        const message = err.message || "Something went wrong";
        error = new ApiError(statusCode, message, 
        // Send native error stack only in development environment
        process.env.NODE_ENV === "development" ? [{ stack: err.stack }] : [], 
        // Set the native error stack and capture the current stack trace
        err.stack);
    }
    else {
        error = err;
    }
    // Destructure required properties from the error object
    const { statusCode = 500, message = "Something went wrong", errors = [], } = error;
    // Send response
    return res.status(statusCode).json({
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
};
export { errorHandler };
//# sourceMappingURL=error.middleware.js.map