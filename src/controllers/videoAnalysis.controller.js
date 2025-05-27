import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { addVideoAnalysisJob } from "../queues/videoAnalysis.queue.js";
import videoAnalysisWorker from "../workers/videoAnalysis.worker.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Reusable function to queue video analysis job
 * Can be used by both API endpoints and internal triggers
 * @param {Object} params - Parameters for video analysis
 * @param {string} params.interviewId - Interview ID
 * @param {Object} options - Additional options for the job
 * @returns {Promise<Object>} Job information
 */
export const queueVideoAnalysis = async ({ interviewId }, options = {}) => {
  try {
    // Check if worker is running
    if (!videoAnalysisWorker.isRunning()) {
      throw new ApiError(
        503,
        "Video analysis service is unavailable. Please try again later or contact support."
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
        "Interview must be completed before video analysis"
      );
    }

    // Check if video recording exists
    const videoUrl = interview.recordings?.video;
    if (!videoUrl) {
      throw new ApiError(
        400,
        "No video recording found for this interview. Video analysis requires a video recording."
      );
    }

    // Check if interview report exists
    const existingReport = await InterviewReport.findOne({ interviewId });
    if (!existingReport) {
      throw new ApiError(
        400,
        "Interview report must be generated before video analysis"
      );
    }

    // Check if video analysis already exists or is in progress
    if (existingReport.videoAnalysis?.analysis) {
      logger.info(
        `Video analysis already exists for interview: ${interviewId}`
      );
      return {
        status: "already_exists",
        message: "Video analysis already completed for this interview",
        analysis: existingReport.videoAnalysis,
      };
    }

    // Queue the video analysis job
    const job = await addVideoAnalysisJob(
      {
        interviewId,
        userId: interview.userId._id.toString(),
      },
      options
    );

    logger.info(
      `Video analysis job queued successfully for interview: ${interviewId}, job ID: ${job.id}`
    );

    return {
      status: "queued",
      jobId: job.id,
      message: "Video analysis job queued successfully",
      estimatedTime: "5-10 minutes",
    };
  } catch (error) {
    logger.error(
      `Error queueing video analysis for interview ${interviewId}:`,
      error
    );
    throw error;
  }
};

/**
 * API endpoint to manually trigger video analysis
 */
const analyzeVideo = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const result = await queueVideoAnalysis({ interviewId });

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
      `Error in analyzeVideo controller for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to analyze video");
  }
});

/**
 * Get video analysis status for an interview
 */
const getVideoAnalysisStatus = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const interviewReport = await InterviewReport.findOne({ interviewId });

    if (!interviewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    const videoAnalysis = interviewReport.videoAnalysis;

    let status = "not_started";
    let message = "Video analysis has not been started";

    if (videoAnalysis?.error) {
      status = "failed";
      message = `Video analysis failed: ${videoAnalysis.error}`;
    } else if (videoAnalysis?.analysis) {
      status = "completed";
      message = "Video analysis completed successfully";
    } else {
      // Check if there's a job in progress (this would require job tracking)
      status = "not_started";
      message = "Video analysis has not been started";
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          interviewId,
          status,
          message,
          videoAnalysis: videoAnalysis || null,
          analyzedAt: videoAnalysis?.analyzedAt || null,
          fileSize: videoAnalysis?.fileSize || null,
        },
        "Video analysis status retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(
      `Error getting video analysis status for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to get video analysis status");
  }
});

/**
 * Get video analysis result for an interview
 */
const getVideoAnalysisResult = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  try {
    const interviewReport = await InterviewReport.findOne({ interviewId });

    if (!interviewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    const videoAnalysis = interviewReport.videoAnalysis;

    if (!videoAnalysis?.analysis) {
      throw new ApiError(404, "Video analysis not found or not completed");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          interviewId,
          analysis: videoAnalysis.analysis,
          analyzedAt: videoAnalysis.analyzedAt,
          fileSize: videoAnalysis.fileSize,
          googleFileName: videoAnalysis.googleFileName,
        },
        "Video analysis result retrieved successfully"
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(
      `Error getting video analysis result for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, "Failed to get video analysis result");
  }
});

export { analyzeVideo, getVideoAnalysisResult, getVideoAnalysisStatus };
