import { Queue } from "bullmq";
import logger from "../logger/winston.logger.js";

/**
 * Video Analysis Queue Configuration
 * Handles video processing jobs with production-ready settings
 */
export const VIDEO_ANALYSIS_QUEUE = "video-analysis";

/**
 * Queue options for video analysis jobs
 */
const queueOptions = {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
  },
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
 * Create video analysis queue instance
 */
export const videoAnalysisQueue = new Queue(VIDEO_ANALYSIS_QUEUE, queueOptions);

/**
 * Queue event listeners for monitoring and logging
 */
videoAnalysisQueue.on("error", (error) => {
  logger.error("Video Analysis Queue Error:", error);
});

videoAnalysisQueue.on("waiting", (jobId) => {
  logger.info(`Video analysis job ${jobId} is waiting`);
});

videoAnalysisQueue.on("active", (job) => {
  logger.info(`Video analysis job ${job.id} started processing`);
});

videoAnalysisQueue.on("completed", (job) => {
  logger.info(`Video analysis job ${job.id} completed successfully`);
});

videoAnalysisQueue.on("failed", (job, error) => {
  logger.error(`Video analysis job ${job?.id} failed:`, error);
});

videoAnalysisQueue.on("stalled", (jobId) => {
  logger.warn(`Video analysis job ${jobId} stalled`);
});

/**
 * Add video analysis job to queue
 * @param {Object} jobData - Job data containing interview details
 * @param {string} jobData.interviewId - Interview ID
 * @param {string} jobData.userId - User ID
 * @param {Object} options - Job options (optional)
 * @returns {Promise<Job>} The created job
 */
export const addVideoAnalysisJob = async (jobData, options = {}) => {
  try {
    const job = await videoAnalysisQueue.add(
      "analyze-video",
      {
        ...jobData,
        timestamp: Date.now(),
      },
      {
        ...options,
        jobId: `video-analysis-${jobData.interviewId}-${Date.now()}`,
      }
    );

    logger.info(
      `Video analysis job ${job.id} added to queue for interview ${jobData.inte}`
    );
    return job;
  } catch (error) {
    logger.error("Error adding videoysis job to queue:", error);
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
      videoAnalysisQueue.getWaiting(),
      videoAnalysisQueue.getActive(),
      videoAnalysisQueue.getCompleted(),
      videoAnalysisQueue.getFailed(),
      videoAnalysisQueue.getDelayed(),
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
