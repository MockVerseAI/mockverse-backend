/**
 * @description Common Error class to throw an error from anywhere.
 * The error handler middleware will catch this error at the central place and it will return an appropriate response to the client
 */
class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: any[];

  /**
   * Create a new API Error
   * @param statusCode HTTP status code
   * @param message Error message
   * @param errors Additional error details
   * @param stack Error stack trace
   */
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
