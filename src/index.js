import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";

// Only load New Relic in non-development environments
import("newrelic");

import connectDB from "./db/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request.logger.middleware.js";

// routers
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "./logger/winston.logger.js";
import applicationRouter from "./routes/application.routes.js";
import heathcheckRouter from "./routes/healthcheck.routes.js";
import interviewTemplateRouter from "./routes/interviewTemplate.routes.js";
import interviewWorkspacesRouter from "./routes/interviewWorkspaces.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import userRouter from "./routes/user.routes.js";
import positionsRouter from "./routes/positions.routes.js";
import deepgramRouter from "./routes/deepgram.routes.js";
import llmRouter from "./routes/llm.routes.js";
import { ApiError } from "./utils/ApiError.js";
import sanitizeBody from "./middlewares/sanitize.middleware.js";

const app = express();

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  })
);
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.limit
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});
app.use(limiter);

// Set trust proxy for correct client IP detection behind load balancers
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(sanitizeBody);

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Add request logger middleware
app.use(requestLogger);

// routes
app.use("/api/v1/healthcheck", heathcheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/interview-workspace", interviewWorkspacesRouter);
app.use("/api/v1/interview-template", interviewTemplateRouter);
app.use("/api/v1/interview", interviewRouter);
app.use("/api/v1/resume", resumeRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/positions", positionsRouter);
app.use("/api/v1/deepgram", deepgramRouter);
app.use("/api/v1/llm", llmRouter);

app.use(errorHandler);

// Log application startup events
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(process.env.PORT, () => {
      logger.info(`🚀 Server is listening on port ${process.env.PORT}...`);
    });

    // Handle server shutdown gracefully
    const gracefulShutdown = () => {
      logger.info("Received shutdown signal, closing server gracefully...");
      server.close(() => {
        logger.info("Server closed successfully");
        process.exit(0);
      });

      // Force close after 10s if server hasn't closed gracefully
      setTimeout(() => {
        logger.error("Server shutdown timed out, forcing exit");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
});
