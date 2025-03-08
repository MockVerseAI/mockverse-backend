import { ApiResponseType } from "../types/index.js";
/**
 * Standard API response format
 */
declare class ApiResponse<T = any> implements ApiResponseType<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    /**
     * Create a new API Response
     * @param statusCode HTTP status code
     * @param data Response data
     * @param message Response message
     */
    constructor(statusCode: number, data: T, message?: string);
}
export { ApiResponse };
