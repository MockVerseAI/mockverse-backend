import { Router } from "express";
import {
  cleanQueue,
  getFailedJobs,
  getQueueHealthStatus,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  retryFailedJob,
} from "../controllers/queue.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public health check endpoint (no auth required for monitoring)
router.route("/health").get(getQueueHealthStatus);

// Protected routes - require authentication
router.use(verifyJWT);

// Queue statistics and monitoring
router.route("/stats").get(getQueueStats);
router.route("/failed").get(getFailedJobs);

// Queue management operations
router.route("/retry/:jobId").post(retryFailedJob);
router.route("/clean").post(cleanQueue);
router.route("/pause").post(pauseQueue);
router.route("/resume").post(resumeQueue);

export default router;
