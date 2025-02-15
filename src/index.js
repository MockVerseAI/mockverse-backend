import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";
import "newrelic";

import connectDB from "./db/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// routers
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "./logger/winston.logger.js";
import applicationRouter from "./routes/application.routes.js";
import heathcheckRouter from "./routes/healthcheck.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import userRouter from "./routes/user.routes.js";
import { ApiError } from "./utils/ApiError.js";

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

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

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

// routes
app.use("/api/v1/healthcheck", heathcheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/interview", interviewRouter);
app.use("/api/v1/resume", resumeRouter);
app.use("/api/v1/application", applicationRouter);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is listening on port ${process.env.PORT}...`);
  });
};

startServer();

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});
