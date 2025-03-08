/**
 * Standard API response format
 */
class ApiResponse {
    /**
     * Create a new API Response
     * @param statusCode HTTP status code
     * @param data Response data
     * @param message Response message
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
export { ApiResponse };
//# sourceMappingURL=ApiResponse.js.map