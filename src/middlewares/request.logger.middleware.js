import { v4 as uuidv4 } from "uuid";
import logger from "../logger/winston.logger.js";

/**
 * Request logger middleware that captures HTTP request details
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const start = performance.now();
  const { method, originalUrl, ip } = req;

  const requestId = uuidv4();

  req.requestId = requestId;

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

    return originalEnd.apply(this, args);
  };

  next();
};
