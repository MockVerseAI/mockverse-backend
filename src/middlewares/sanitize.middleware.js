// Create a sanitization middleware (src/middlewares/sanitize.middleware.js)
import { sanitizeFilter } from "mongoose";
import xss from "xss";

/**
 * Sanitizes request body and query data against XSS and NoSQL injection attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeBody = (req, res, next) => {
  try {
    // Sanitize request body if it exists
    if (req.body) {
      req.body = sanitizeData(req.body);
      // Apply mongoose sanitizeFilter as an additional layer of protection
      req.body = sanitizeFilter(req.body);
    }

    // Sanitize query parameters if they exist
    if (req.query) {
      req.query = sanitizeData(req.query);
      // Apply mongoose sanitizeFilter to query params as well
      req.query = sanitizeFilter(req.query);
    }

    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    return res.status(400).json({
      error: "Invalid input data",
      message: "Request contains potentially malicious data",
    });
  }
};

/**
 * Recursively sanitizes data objects and arrays
 * @param {*} data - The data to sanitize
 * @returns {*} Sanitized data
 */
const sanitizeData = (data) => {
  // Return primitives as-is (except strings, which are handled later)
  if (data === null || data === undefined || typeof data !== "object") {
    return typeof data === "string" ? sanitizeString(data) : data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  // Create a new object to avoid prototype pollution
  const sanitized = {};

  // Process each property in the object
  for (const [key, value] of Object.entries(data)) {
    // Skip properties with keys starting with $ (MongoDB operators)
    if (key.startsWith("$")) {
      continue;
    }

    // Skip properties with keys containing dangerous patterns
    if (
      /\.\$|\.\$\./i.test(key) ||
      /__proto__|constructor|prototype/i.test(key)
    ) {
      continue;
    }

    // Sanitize the value based on its type
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitizes string values
 * @param {string} str - The string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  // Apply XSS sanitization
  return xss(str.trim());
};

export default sanitizeBody;
