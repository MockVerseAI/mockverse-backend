import { Request, Response, NextFunction } from "express";
import newrelic from "newrelic";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger/winston.logger.js";

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Request logger middleware that captures HTTP request details and sends custom metrics to New Relic
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  const requestId = uuidv4();

  // Add request ID to the request object for tracking
  req.requestId = requestId;

  // Add custom attributes to New Relic
  newrelic.addCustomAttribute("requestId", requestId);
  newrelic.addCustomAttribute("userIp", ip);

  // Store the original end function to restore later
  const originalEnd = res.end;

  // Override the end method to capture response details
  res.end = function (this: Response, ...args: any[]): any {
    // Restore the original end method
    res.end = originalEnd;

    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log the request details
    logger.info(`[${method}] ${originalUrl} ${statusCode}`, {
      requestId,
      duration,
      ip,
      payload: req.body,
      userAgent: req.get("user-agent"),
    });

    // Record metrics to New Relic
    newrelic.recordMetric(`Custom/Request/${method}`, duration);
    newrelic.recordMetric(`Custom/Response/Status/${statusCode}`, 1);

    // Record slow requests (over 1 second)
    if (duration > 1000) {
      newrelic.recordCustomEvent("SlowRequest", {
        requestId,
        method,
        url: originalUrl,
        duration,
        statusCode,
      });
    }

    // Call the original end method
    return originalEnd.apply(this, args);
  };

  next();
};
