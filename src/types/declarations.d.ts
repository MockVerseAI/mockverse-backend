// Declaration file for modules that don't have type definitions
declare module "newrelic";

// Declare the modules we haven't migrated yet but need to use
declare module "./middlewares/error.middleware.js" {
  export const errorHandler: import("express").ErrorRequestHandler;
}

declare module "./middlewares/request.logger.middleware.js" {
  export const requestLogger: import("express").RequestHandler;
}

declare module "./logger/winston.logger.js" {
  const logger: {
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    http: (...args: any[]) => void;
    verbose: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    silly: (...args: any[]) => void;
  };
  export default logger;
}

// Declare route modules
declare module "./routes/application.routes.js" {
  const router: import("express").Router;
  export default router;
}

declare module "./routes/healthcheck.routes.js" {
  const router: import("express").Router;
  export default router;
}

declare module "./routes/interview.routes.js" {
  const router: import("express").Router;
  export default router;
}

declare module "./routes/resume.routes.js" {
  const router: import("express").Router;
  export default router;
}

declare module "./routes/user.routes.js" {
  const router: import("express").Router;
  export default router;
}

declare module "./routes/positions.routes.js" {
  const router: import("express").Router;
  export default router;
}
