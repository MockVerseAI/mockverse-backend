/**
 * @description Common Error class to throw an error from anywhere.
 * The error handler middleware will catch this error at the central place and it will return an appropriate response to the client
 */
declare class ApiError extends Error {
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
    constructor(statusCode: number, message?: string, errors?: any[], stack?: string);
}
export { ApiError };
