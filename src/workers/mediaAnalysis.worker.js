import { Worker } from "bullmq";
import logger from "../logger/winston.logger.js";
import { processMediaAnalysis } from "../services/mediaAnalysis.service.js";
import { MEDIA_ANALYSIS_QUEUE } from "../queues/mediaAnalysis.queue.js";
import { redisConnectionConfig } from "../config/redis.js";

let worker = null;
let isShuttingDown = false;

/**
 * Process individual job
 * @param {Job} job - BullMQ job instance
 * @returns {Promise<Object>} Job result
 */
const processJob = async (job) => {
  const { data } = job;
  const { interviewId, userId } = data;

  try {
    logger.info(
      `Processing media analysis job ${job.id} for interview ${interviewId}`
    );

    // Update job progress
    await job.updateProgress(10);

    // Validate job data
    if (!interviewId || !userId) {
      throw new Error("Missing required job data: interviewId or userId");
    }

    await job.updateProgress(20);

    // Process media analysis
    const result = await processMediaAnalysis(data);

    await job.updateProgress(100);

    logger.info(`Media analysis job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Media analysis job ${job.id} failed:`, error);

    // Add error context to job
    job.data.error = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    throw error;
  }
};

/**
 * Setup worker event listeners for monitoring and logging
 */
const setupEventListeners = (workerInstance) => {
  workerInstance.on("ready", () => {
    logger.info("Media Analysis Worker is ready");
  });

  workerInstance.on("error", (error) => {
    logger.error("❌ Media Analysis Worker error:", error);

    // Handle specific Redis errors
    if (error.message?.includes("Command timed out")) {
      logger.warn(
        "🔄 Redis command timeout detected - this may indicate Redis server issues"
      );
    } else if (error.message?.includes("Connection is closed")) {
      logger.warn("🔌 Redis connection closed unexpectedly");
    }
  });

  workerInstance.on("failed", (job, error) => {
    logger.error(`Media analysis job ${job?.id} failed:`, {
      jobId: job?.id,
      interviewId: job?.data?.interviewId,
      error: error.message,
      stack: error.stack,
      attempts: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
    });
  });

  workerInstance.on("completed", (job, result) => {
    logger.info(`Media analysis job ${job.id} completed:`, {
      jobId: job.id,
      interviewId: job.data?.interviewId,
      processingTime: Date.now() - job.processedOn,
      success: result?.success,
    });
  });

  workerInstance.on("progress", (job, progress) => {
    logger.debug(`Media analysis job ${job.id} progress: ${progress}%`);
  });

  workerInstance.on("stalled", (jobId) => {
    logger.warn(`Media analysis job ${jobId} stalled`);
  });

  workerInstance.on("active", (job) => {
    logger.info(`Media analysis job ${job.id} started processing`);
  });
};

/**
 * Check if Redis is available
 * @returns {Promise<boolean>}
 */
const checkRedisAvailability = async () => {
  try {
    const { isRedisAvailable } = await import("../config/redis.js");
    return await isRedisAvailable(3000); // 3 second timeout
  } catch (error) {
    logger.error("Error checking Redis availability:", error);
    return false;
  }
};

/**
 * Initialize and start the worker
 */
export const startWorker = async () => {
  try {
    // Check Redis availability first
    const redisAvailable = await checkRedisAvailability();

    if (!redisAvailable) {
      throw new Error(
        "Redis is not available. Please start Redis server before starting the worker."
      );
    }

    // Create worker with Redis connection configuration
    worker = new Worker(MEDIA_ANALYSIS_QUEUE, processJob, {
      connection: redisConnectionConfig,
      concurrency: parseInt(process.env.MEDIA_WORKER_CONCURRENCY) || 2,
      maxStalledCount: 1,
      stalledInterval: 30000,
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 1,
      },
    });

    // Setup event listeners
    setupEventListeners(worker);

    logger.info("✅ Media Analysis Worker started successfully");
    logger.info(
      `🔧 Worker concurrency: ${parseInt(process.env.MEDIA_WORKER_CONCURRENCY) || 2}`
    );
  } catch (error) {
    logger.error("❌ Failed to start Media Analysis Worker:", error);
    throw error;
  }
};

/**
 * Check if worker is running and healthy
 * @returns {boolean} True if worker is running
 */
export const isWorkerRunning = () => {
  return worker && !worker.closing && !isShuttingDown;
};

/**
 * Get worker health status
 * @returns {Object} Worker health information
 */
export const getWorkerHealthStatus = () => {
  return {
    isRunning: isWorkerRunning(),
    isShuttingDown,
    concurrency: worker?.opts?.concurrency || 0,
    stalledInterval: worker?.opts?.stalledInterval || 0,
  };
};

/**
 * Gracefully shutdown the worker
 * @returns {Promise<void>}
 */
export const shutdownWorker = async () => {
  if (isShuttingDown) {
    logger.info("Worker is already shutting down");
    return;
  }

  isShuttingDown = true;
  logger.info("Initiating graceful shutdown of Media Analysis Worker...");

  try {
    if (worker) {
      // Close the worker gracefully
      await worker.close();
      worker = null;
      logger.info("✅ Media Analysis Worker shutdown completed");
    }
  } catch (error) {
    logger.error("❌ Error during worker shutdown:", error);
    throw error;
  } finally {
    isShuttingDown = false;
  }
};

/**
 * Initialize standalone worker for direct execution
 * Useful for debugging and standalone processing
 */
const initializeStandaloneWorker = async () => {
  try {
    logger.info("🚀 Starting Media Analysis Worker in standalone mode...");

    // Initialize worker
    await startWorker();

    // Setup graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      logger.info(`📤 Received ${signal}. Starting graceful shutdown...`);

      try {
        await shutdownWorker();
        logger.info("👋 Worker shutdown completed. Goodbye!");
        process.exit(0);
      } catch (error) {
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Handle various shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("❌ Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });

    // Keep process alive
    process.stdin.resume();

    logger.info(
      "🎯 Media Analysis Worker is running and ready to process jobs"
    );
    logger.info("💡 Press Ctrl+C to stop the worker gracefully");
  } catch (error) {
    logger.error("❌ Failed to initialize standalone worker:", error);
    process.exit(1);
  }
};

/**
 * Log recovery status and queue information
 */
const logRecoveryStatus = async () => {
  try {
    const { getQueueHealth } = await import("../queues/mediaAnalysis.queue.js");
    const health = await getQueueHealth();

    logger.info("📊 Queue Health Status:", {
      waiting: health.waiting,
      active: health.active,
      completed: health.completed,
      failed: health.failed,
      delayed: health.delayed,
    });

    if (health.failed > 0) {
      logger.warn(
        `⚠️ Found ${health.failed} failed jobs that may need attention`
      );
    }

    if (health.waiting > 0) {
      logger.info(`⏳ ${health.waiting} jobs waiting to be processed`);
    }
  } catch (error) {
    logger.error("❌ Error checking queue health:", error);
  }
};

// Self-contained execution check
if (process.argv[1] === new URL(import.meta.url).pathname) {
  initializeStandaloneWorker();
}

export default {
  startWorker,
  shutdownWorker,
  isRunning: isWorkerRunning,
  getHealthStatus: getWorkerHealthStatus,
  logRecoveryStatus,
};
