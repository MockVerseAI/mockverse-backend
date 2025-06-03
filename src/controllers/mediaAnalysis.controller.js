import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { addMediaAnalysisJob } from "../queues/mediaAnalysis.queue.js";
import mediaAnalysisWorker from "../workers/mediaAnalysis.worker.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Reusable function to queue media analysis job
 * Can be used by both API endpoints and internal triggers
 * @param {Object} params - Parameters for media analysis
 * @param {string} params.interviewId - Interview ID
 * @param {Object} options - Additional options for the job
 * @returns {Promise<Object>} Job information
 */
export const queueMediaAnalysis = async ({ interviewId }, options = {}) => {
  try {
    // Check if worker is running
    if (!mediaAnalysisWorker.isRunning()) {
      throw new ApiError(
        503,
        "Media analysis service is unavailable. Please try again later or contact support."
      );
    }

    // Validate required parameters
    if (!interviewId) {
      throw new ApiError(400, "Missing required parameter: interviewId");
    }

    // Validate interview exists and is completed
    const interview = await Interview.findById(interviewId).populate(
      "userId",
      "_id"
    );
    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    if (!interview.isCompleted) {
      throw new ApiError(
        400,
        "Interview must be completed before media analysis"
      );
    }

    // Check if any media recording exists (video or audio)
    const hasVideo = interview.recordings?.video;
    const hasAudio =
      interview.recordings?.voice?.combined ||
      interview.recordings?.voice?.user;

    if (!hasVideo && !hasAudio) {
      throw new ApiError(
        400,
        "No video or audio recording found for this interview. Media analysis requires either a video or audio recording."
      );
    }

    // Check if interview report exists
    const existingReport = await InterviewReport.findOne({ interviewId });
    if (!existingReport) {
      throw new ApiError(
        400,
        "Interview report must be generated before media analysis"
      );
    }

    // Check if media analysis already exists or is in progress
    if (existingReport.mediaAnalysis?.isCompleted) {
      logger.info(
        `Media analysis already exists for interview: ${interviewId}`
      );
      return {
        status: "already_exists",
        message: "Media analysis already completed for this interview",
        analysis: existingReport.mediaAnalysis,
      };
    }

    // Queue the media analysis job
    const job = await addMediaAnalysisJob(
      {
        interviewId,
        userId: interview.userId._id.toString(),
      },
      options
    );

    logger.info(
      `Media analysis job queued successfully for interview: ${interviewId}, job ID: ${job.id}`
    );

    return {
      status: "queued",
      jobId: job.id,
      message: "Media analysis job queued successfully",
      estimatedTime: "5-10 minutes",
    };
  } catch (error) {
    logger.error(
      `Error queueing media analysis for interview ${interviewId}:`,
      error
    );
    throw error;
  }
};

/**
 * API endpoint to manually trigger media analysis
 */
const analyzeMedia = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const result = await queueMediaAnalysis({ interviewId });

    return res
      .status(result.status === "already_exists" ? 200 : 201)
      .json(
        new ApiResponse(
          result.status === "already_exists" ? 200 : 201,
          result,
          result.message
        )
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(
      `Error in analyzeMedia controller for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to analyze media");
  }
});

/**
 * Get media analysis status for an interview
 */
const getMediaAnalysisStatus = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const interviewReport = await InterviewReport.findOne({ interviewId });

    if (!interviewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    const mediaAnalysis = interviewReport.mediaAnalysis;

    let status = "not_started";
    let message = "Media analysis has not been started";

    if (mediaAnalysis?.error) {
      status = "failed";
      message = `Media analysis failed: ${mediaAnalysis.error}`;
    } else if (mediaAnalysis?.analysis) {
      status = "completed";
      message = "Media analysis completed successfully";
    } else {
      // Check if there's a job in progress (this would require job tracking)
      status = "not_started";
      message = "Media analysis has not been started";
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          interviewId,
          status,
          message,
          mediaType: mediaAnalysis?.type || null,
          mediaAnalysis: mediaAnalysis || null,
          analyzedAt: mediaAnalysis?.analyzedAt || null,
          fileSize: mediaAnalysis?.fileSize || null,
          processingDuration: mediaAnalysis?.processingDuration || null,
        },
        "Media analysis status retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(
      `Error getting media analysis status for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to get media analysis status");
  }
});

/**
 * Get media analysis result for an interview
 */
const getMediaAnalysisResult = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const interviewReport = await InterviewReport.findOne({ interviewId });

    if (!interviewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    const mediaAnalysis = interviewReport.mediaAnalysis;

    if (!mediaAnalysis?.analysis) {
      throw new ApiError(404, "Media analysis not found or not completed");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          interviewId,
          mediaType: mediaAnalysis.type,
          analysis: mediaAnalysis.analysis,
          analyzedAt: mediaAnalysis.analyzedAt,
          fileSize: mediaAnalysis.fileSize,
          processingDuration: mediaAnalysis.processingDuration,
          googleFileName: mediaAnalysis.googleFileName,
        },
        "Media analysis result retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(
      `Error getting media analysis result for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to get media analysis result");
  }
});

export { analyzeMedia, getMediaAnalysisResult, getMediaAnalysisStatus };
