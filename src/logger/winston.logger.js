import newrelic from "newrelic";
import winston from "winston";

// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Custom format for New Relic
const newRelicFormat = winston.format((info) => {
  // For error and warn levels, send to New Relic
  if (info.level === "error" || info.level === "warn") {
    if (info.error instanceof Error) {
      // If there's an actual error object, send it to New Relic
      newrelic.noticeError(info.error, {
        message: info.message,
        level: info.level,
        ...info.metadata,
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

// Chose the aspect of your log customizing the log format.
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
  winston.format.printf((info) => {
    const { timestamp, level, message, metadata, stack } = info;

    // Format metadata if it exists and has properties
    const metadataStr =
      metadata && Object.keys(metadata).length
        ? JSON.stringify(metadata, null, 2)
        : "";

    // Format the message based on its type
    let formattedMessage;
    if (typeof message === "object") {
      formattedMessage = JSON.stringify(message, null, 2);
    } else {
      formattedMessage = message;
    }

    // Include stack trace if available
    const stackTrace = stack ? `\n${stack}` : "";

    return `[${timestamp}] ${level}: ${formattedMessage} ${metadataStr} ${stackTrace}`.trim();
  })
);

// Define which transports the logger must use to print out messages.
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

// Create the logger instance that has to be exported
// and used to log messages.
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Helper methods for structured logging with metadata
logger.logWithMetadata = (level, message, metadata) => {
  logger[level](message, { metadata });
};

export default logger;
