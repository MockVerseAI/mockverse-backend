/**
 * Wraps an async request handler to automatically catch errors and forward them to the next middleware
 * @param requestHandler The async handler function to wrap
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
export { asyncHandler };
//# sourceMappingURL=asyncHandler.js.map