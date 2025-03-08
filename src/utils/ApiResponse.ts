import { ApiResponseType } from "../types/index.js";

/**
 * Standard API response format
 */
class ApiResponse<T = any> implements ApiResponseType<T> {
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
  constructor(statusCode: number, data: T, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
