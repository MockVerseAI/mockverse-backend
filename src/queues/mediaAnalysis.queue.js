import { Queue } from "bullmq";
import logger from "../logger/winston.logger.js";
import { redisConnectionConfig } from "../config/redis.js";

/**
 * Media Analysis Queue Configuration
 * Handles media processing jobs with production-ready settings
 */
export const MEDIA_ANALYSIS_QUEUE = "media-analysis";

/**
 * Queue options for media analysis jobs
 */
const queueOptions = {
  connection: redisConnectionConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5 seconds
    },
    removeOnComplete: 10, // Keep only 10 completed jobs
    removeOnFail: 50, // Keep 50 failed jobs for debugging
    delay: 1000, // 1 second delay before processing
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 1, // Max number of stalled attempts
  },
};

/**
 * Create media analysis queue instance
 */
export const mediaAnalysisQueue = new Queue(MEDIA_ANALYSIS_QUEUE, queueOptions);

/**
 * Queue event listeners for monitoring and logging
 */
mediaAnalysisQueue.on("error", (error) => {
  logger.error("Media Analysis Queue Error:", error);
});

mediaAnalysisQueue.on("waiting", (jobId) => {
  logger.info(`Media analysis job ${jobId} is waiting`);
});

mediaAnalysisQueue.on("active", (job) => {
  logger.info(`Media analysis job ${job.id} started processing`);
});

mediaAnalysisQueue.on("completed", (job) => {
  logger.info(`Media analysis job ${job.id} completed successfully`);
});

mediaAnalysisQueue.on("failed", (job, error) => {
  logger.error(`Media analysis job ${job?.id} failed:`, error);
});

mediaAnalysisQueue.on("stalled", (jobId) => {
  logger.warn(`Media analysis job ${jobId} stalled`);
});

/**
 * Add media analysis job to queue
 * @param {Object} jobData - Job data containing interview details
 * @param {string} jobData.interviewId - Interview ID
 * @param {string} jobData.userId - User ID
 * @param {Object} options - Job options (optional)
 * @returns {Promise<Job>} The created job
 */
export const addMediaAnalysisJob = async (jobData, options = {}) => {
  try {
    const job = await mediaAnalysisQueue.add(
      "analyze-media",
      {
        ...jobData,
        timestamp: Date.now(),
      },
      {
        ...options,
        jobId: `media-analysis-${jobData.interviewId}-${Date.now()}`,
      }
    );

    logger.info(
      `Media analysis job ${job.id} added to queue for interview ${jobData.interviewId}`
    );
    return job;
  } catch (error) {
    logger.error("Error adding media analysis job to queue:", error);
    throw error;
  }
};

/**
 * Get queue health metrics
 * @returns {Promise<Object>} Queue health information
 */
export const getQueueHealth = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      mediaAnalysisQueue.getWaiting(),
      mediaAnalysisQueue.getActive(),
      mediaAnalysisQueue.getCompleted(),
      mediaAnalysisQueue.getFailed(),
      mediaAnalysisQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  } catch (error) {
    logger.error("Error getting queue health:", error);
    throw error;
  }
};
