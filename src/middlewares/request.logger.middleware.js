import newrelic from "newrelic";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger/winston.logger.js";

/**
 * Request logger middleware that captures HTTP request details and sends custom metrics to New Relic
 *̦
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const start = performance.now();
  const { method, originalUrl, ip } = req;

  const requestId = uuidv4();

  req.requestId = requestId;

  newrelic.addCustomAttribute("requestId", requestId);
  newrelic.addCustomAttribute("userIp", ip);

  const originalEnd = res.end;

  res.end = function (...args) {
    res.end = originalEnd;

    const duration = performance.now() - start;

    const statusCode = res.statusCode;

    logger.info(`[${method}] ${originalUrl} ${statusCode}`, {
      requestId,
      duration,
      ip,
      payload: req.body,
      userAgent: req.get("user-agent"),
    });

    newrelic.recordMetric(`Custom/Request/${method}`, duration);
    newrelic.recordMetric(`Custom/Response/Status/${statusCode}`, 1);

    if (duration > 1000) {
      newrelic.recordCustomEvent("SlowRequest", {
        requestId,
        method,
        url: originalUrl,
        duration,
        statusCode,
      });
    }

    return originalEnd.apply(this, args);
  };

  next();
};
