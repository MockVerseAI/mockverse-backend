import newrelic from "newrelic";
import winston from "winston";

/**
 * Custom levels for logger - from most severe to least severe
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Type for the level keys
type LogLevel = keyof typeof levels;

/**
 * Determine the logging level based on environment
 * Always returns debug to show all logs in all environments
 */
const level = (): string => {
  return "debug";
};

/**
 * Define colors for each level for visual distinction
 */
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Apply colors to log levels
winston.addColors(colors);

// Extend winston info interface to include our custom properties
interface ExtendedLogInfo extends winston.Logform.TransformableInfo {
  metadata?: Record<string, any>;
  error?: Error;
  stack?: string;
}

/**
 * Custom format for New Relic integration
 * Sends errors and warnings to New Relic
 */
const newRelicFormat = winston.format((info: ExtendedLogInfo) => {
  // For error and warn levels, send to New Relic
  if (info.level === "error" || info.level === "warn") {
    if (info.error instanceof Error) {
      // If there's an actual error object, send it to New Relic
      newrelic.noticeError(info.error, {
        message: info.message,
        level: info.level,
        ...(info.metadata || {}),
      });
    } else {
      // Otherwise send the message as a custom event
      newrelic.recordCustomEvent(`${info.level.toUpperCase()}`, {
        message: info.message,
        ...(info.metadata || {}),
      });
    }
  }
  return info;
});

/**
 * Format configuration for winston logger
 */
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  // Add New Relic integration
  newRelicFormat(),
  // Extract any Error objects to get proper stack traces
  winston.format.errors({ stack: true }),
  // Add metadata support
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "label"],
  }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Handle object logging
  winston.format.json(),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf((info: ExtendedLogInfo) => {
    const { timestamp, level, message, metadata, stack } = info;

    // Format metadata if it exists and has properties
    const metadataStr =
      metadata && Object.keys(metadata).length
        ? JSON.stringify(metadata, null, 2)
        : "";

    // Format the message based on its type
    let formattedMessage: string;
    if (typeof message === "object") {
      formattedMessage = JSON.stringify(message, null, 2);
    } else {
      formattedMessage = message as string;
    }

    // Include stack trace if available
    const stackTrace = stack ? `\n${stack}` : "";

    return `[${timestamp}] ${level}: ${formattedMessage} ${metadataStr} ${stackTrace}`.trim();
  })
);

/**
 * Define transports for logging (console, files)
 */
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),
  new winston.transports.File({
    filename: "logs/combined.log",
    maxsize: 10485760, // 10MB
    maxFiles: 10,
  }),
  new winston.transports.File({
    filename: "logs/http.log",
    level: "http",
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
];

/**
 * Extend the winston logger interface to add our custom method
 */
interface ExtendedLogger extends winston.Logger {
  logWithMetadata: (
    level: string,
    message: string,
    metadata: Record<string, any>
  ) => void;
}

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
}) as ExtendedLogger;

/**
 * Helper method for structured logging with metadata
 */
logger.logWithMetadata = (
  level: LogLevel | string,
  message: string,
  metadata: Record<string, any>
): void => {
  (logger as any)[level](message, { metadata });
};

export default logger;
