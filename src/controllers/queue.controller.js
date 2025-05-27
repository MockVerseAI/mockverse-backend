import logger from "../logger/winston.logger.js";
import {
  getQueueHealth,
  videoAnalysisQueue,
} from "../queues/videoAnalysis.queue.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get queue health metrics
 */
const getQueueHealthStatus = asyncHandler(async (req, res) => {
  try {
    const healthMetrics = await getQueueHealth();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          queue: "video-analysis",
          status: "healthy",
          metrics: healthMetrics,
          timestamp: new Date().toISOString(),
        },
        "Queue health retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting queue health:", error);
    throw new ApiError(500, "Failed to get queue health status");
  }
});

/**
 * Get detailed queue statistics
 */
const getQueueStats = asyncHandler(async (req, res) => {
  try {
    const [waiting, active, completed, failed, delayed, paused] =
      await Promise.all([
        videoAnalysisQueue.getWaiting(),
        videoAnalysisQueue.getActive(),
        videoAnalysisQueue.getCompleted(),
        videoAnalysisQueue.getFailed(),
        videoAnalysisQueue.getDelayed(),
        videoAnalysisQueue.isPaused(),
      ]);

    const stats = {
      queue: "video-analysis",
      counts: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      },
      isPaused: paused,
      timestamp: new Date().toISOString(),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Queue statistics retrieved successfully")
      );
  } catch (error) {
    logger.error("Error getting queue statistics:", error);
    throw new ApiError(500, "Failed to get queue statistics");
  }
});

/**
 * Get failed jobs for debugging
 */
const getFailedJobs = asyncHandler(async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const failedJobs = await videoAnalysisQueue.getFailed(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    const jobsData = failedJobs.map((job) => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          jobs: jobsData,
          total: failedJobs.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
        "Failed jobs retrieved successfully"
      )
    );
  } catch (error) {
    logger.error("Error getting failed jobs:", error);
    throw new ApiError(500, "Failed to get failed jobs");
  }
});

/**
 * Retry failed job
 */
const retryFailedJob = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await videoAnalysisQueue.getJob(jobId);
    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    if (job.finishedOn && !job.failedReason) {
      throw new ApiError(400, "Job is not in failed state");
    }

    await job.retry();
    logger.info(`Retried failed job: ${jobId}`);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { jobId, status: "retried" },
          "Job retried successfully"
        )
      );
  } catch (error) {
    logger.error(`Error retrying job ${req.params.jobId}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to retry job");
  }
});

/**
 * Clean up completed and failed jobs
 */
const cleanQueue = asyncHandler(async (req, res) => {
  try {
    const {
      olderThan = 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      limit = 100,
    } = req.body;

    const [cleanedCompleted, cleanedFailed, cleanedPaused] = await Promise.all([
      videoAnalysisQueue.clean(
        parseInt(olderThan),
        parseInt(limit),
        "completed"
      ),
      videoAnalysisQueue.clean(parseInt(olderThan), parseInt(limit), "failed"),
      videoAnalysisQueue.clean(parseInt(olderThan), parseInt(limit), "paused"),
    ]);

    logger.info(
      `Cleaned queue: ${cleanedCompleted.length} completed, ${cleanedFailed.length} failed jobs`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          cleaned: {
            completed: cleanedCompleted.length,
            failed: cleanedFailed.length,
            paused: cleanedPaused.length,
          },
          olderThan: parseInt(olderThan),
          limit: parseInt(limit),
        },
        "Queue cleaned successfully"
      )
    );
  } catch (error) {
    logger.error("Error cleaning queue:", error);
    throw new ApiError(500, "Failed to clean queue");
  }
});

/**
 * Pause the queue
 */
const pauseQueue = asyncHandler(async (req, res) => {
  try {
    await videoAnalysisQueue.pause();
    logger.info("Video analysis queue paused");

    return res
      .status(200)
      .json(
        new ApiResponse(200, { status: "paused" }, "Queue paused successfully")
      );
  } catch (error) {
    logger.error("Error pausing queue:", error);
    throw new ApiError(500, "Failed to pause queue");
  }
});

/**
 * Resume the queue
 */
const resumeQueue = asyncHandler(async (req, res) => {
  try {
    await videoAnalysisQueue.resume();
    logger.info("Video analysis queue resumed");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { status: "resumed" },
          "Queue resumed successfully"
        )
      );
  } catch (error) {
    logger.error("Error resuming queue:", error);
    throw new ApiError(500, "Failed to resume queue");
  }
});

export {
  cleanQueue,
  getFailedJobs,
  getQueueHealthStatus,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  retryFailedJob,
};
