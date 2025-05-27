import { Worker } from "bullmq";
import logger from "../logger/winston.logger.js";
import { processVideoAnalysis } from "../services/videoAnalysis.service.js";
import { VIDEO_ANALYSIS_QUEUE } from "../queues/videoAnalysis.queue.js";
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
      `Processing video analysis job ${job.id} for interview ${interviewId}`
    );

    // Update job progress
    await job.updateProgress(10);

    // Validate job data
    if (!interviewId || !userId) {
      throw new Error("Missing required job data: interviewId or userId");
    }

    await job.updateProgress(20);

    // Process video analysis
    const result = await processVideoAnalysis(data);

    await job.updateProgress(100);

    logger.info(`Video analysis job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Video analysis job ${job.id} failed:`, error);

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
    logger.info("Video Analysis Worker is ready");
  });

  workerInstance.on("error", (error) => {
    logger.error("❌ Video Analysis Worker error:", error);

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
    logger.error(`Video analysis job ${job?.id} failed:`, {
      jobId: job?.id,
      interviewId: job?.data?.interviewId,
      error: error.message,
      stack: error.stack,
      attempts: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
    });
  });

  workerInstance.on("completed", (job, result) => {
    logger.info(`Video analysis job ${job.id} completed:`, {
      jobId: job.id,
      interviewId: job.data?.interviewId,
      processingTime: Date.now() - job.processedOn,
      success: result?.success,
    });
  });

  workerInstance.on("progress", (job, progress) => {
    logger.debug(`Video analysis job ${job.id} progress: ${progress}%`);
  });

  workerInstance.on("stalled", (jobId) => {
    logger.warn(`Video analysis job ${jobId} stalled`);
  });

  workerInstance.on("active", (job) => {
    logger.info(`Video analysis job ${job.id} started processing`);
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
    worker = new Worker(VIDEO_ANALYSIS_QUEUE, processJob, {
      connection: redisConnectionConfig,
      concurrency: parseInt(process.env.VIDEO_WORKER_CONCURRENCY) || 2,
      maxStalledCount: 1,
      stalledInterval: 30000,
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 1,
      },
    });

    // Setup event listeners
    setupEventListeners(worker);

    logger.info("✅ Video Analysis Worker started successfully");
    logger.info(
      `🔧 Worker concurrency: ${parseInt(process.env.VIDEO_WORKER_CONCURRENCY) || 2}`
    );
  } catch (error) {
    logger.error("❌ Failed to start Video Analysis Worker:", error);
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
  logger.info("Initiating graceful shutdown of Video Analysis Worker...");

  try {
    if (worker) {
      // Close the worker gracefully
      await worker.close();
      worker = null;
      logger.info("Video Analysis Worker shutdown completed");
    }
  } catch (error) {
    logger.error("Error during worker shutdown:", error);
    throw error;
  } finally {
    isShuttingDown = false;
  }
};

/**
 * Initialize worker for standalone execution
 * Note: This is mainly for potential future use, current setup runs integrated with main server
 */
const initializeStandaloneWorker = async () => {
  if (process.env.NODE_ENV === "test") return;

  try {
    // Import dependencies for standalone mode
    const { default: mongoose } = await import("mongoose");
    const { default: connectDB } = await import("../db/index.js");
    const { closeRedisConnection } = await import("../config/redis.js");

    logger.info("🚀 Starting Video Analysis Worker in standalone mode...");

    // Connect to database
    await connectDB();
    logger.info("📊 Database connected successfully");

    // Start the worker
    await startWorker();

    logger.info("✅ Video Analysis Worker is running");
    logger.info(
      `🔧 Worker concurrency: ${process.env.VIDEO_WORKER_CONCURRENCY || 2}`
    );
    logger.info(
      `📡 Redis host: ${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`
    );

    await logRecoveryStatus();

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`📥 Received ${signal}, shutting down worker gracefully...`);
      try {
        await shutdownWorker();
        await closeRedisConnection();
        await mongoose.connection.close();
        logger.info("✅ Worker shutdown completed successfully");
        process.exit(0);
      } catch (error) {
        logger.error("❌ Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Signal handlers
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGHUP", () => gracefulShutdown("SIGHUP"));

    // Error handlers
    process.on("uncaughtException", (error) => {
      logger.error("💥 Uncaught exception in worker:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("🚫 Unhandled rejection in worker:", { reason, promise });
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("❌ Failed to initialize standalone worker:", error);
    process.exit(1);
  }
};

/**
 * Log startup recovery information
 */
const logRecoveryStatus = async () => {
  try {
    const { getQueueHealth } = await import("../queues/videoAnalysis.queue.js");
    const health = await getQueueHealth();

    logger.info("📊 Queue Recovery Status:");
    logger.info(
      `   🔄 Active jobs: ${health.active} (will be marked as stalled if interrupted)`
    );
    logger.info(`   ⏳ Waiting jobs: ${health.waiting} (fully persistent)`);
    logger.info(`   ❌ Failed jobs: ${health.failed} (available for retry)`);
    logger.info(`   ⏱️ Delayed jobs: ${health.delayed} (scheduled for later)`);

    if (health.active > 0) {
      logger.warn(
        `⚠️ Found ${health.active} active jobs - these may have been interrupted`
      );
      logger.info(
        "🔧 Stall detection will retry interrupted jobs automatically"
      );
    }

    if (health.failed > 0) {
      logger.info(
        `🛠️ ${health.failed} failed jobs available for manual retry via API`
      );
    }
  } catch (error) {
    logger.warn("Could not fetch queue recovery status:", error.message);
  }
};

// Auto-initialize if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load environment variables
  await import("dotenv/config");
  await initializeStandaloneWorker();
}

// Export functions instead of class instance
export default {
  start: startWorker,
  shutdown: shutdownWorker,
  isRunning: isWorkerRunning,
  getHealthStatus: getWorkerHealthStatus,
};
