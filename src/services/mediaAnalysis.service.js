import {
  GoogleGenAI,
  createPartFromUri,
  createUserContent,
} from "@google/genai";
import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { videoAnalysisPrompt, audioAnalysisPrompt } from "../utils/prompts.js";
import { emitToRoom, EVENTS } from "./websocket.service.js";
import { getMediaAnalysisSchema } from "../utils/schemas.js";

/**
 * Singleton Google Generative AI client instance
 */
let genAIInstance = null;

/**
 * Get or create Google Generative AI client instance
 * @returns {GoogleGenAI} Singleton instance
 */
const getGenAIClient = () => {
  if (!genAIInstance) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY environment variable is required"
      );
    }
    genAIInstance = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    logger.info("🤖 Google Generative AI client initialized");
  }
  return genAIInstance;
};

/**
 * Reset the Google Generative AI client instance
 * Useful for testing or credential changes
 */
export const resetGenAIClient = () => {
  genAIInstance = null;
  logger.info("🔄 Google Generative AI client reset");
};

/**
 * Determine media type based on available recordings
 * @param {Object} interview - Interview object with recordings
 * @returns {Object} Media type and URL information
 */
export const determineMediaType = (interview) => {
  const recordings = interview.recordings;

  if (recordings?.video) {
    return {
      type: "video",
      url: recordings.video,
      mimeType: "video/mp4",
    };
  } else if (recordings?.voice?.combined) {
    return {
      type: "audio",
      url: recordings.voice.combined,
      mimeType: "audio/mpeg",
    };
  } else if (recordings?.voice?.user) {
    return {
      type: "audio",
      url: recordings.voice.user,
      mimeType: "audio/mpeg",
    };
  }

  throw new Error("No video or audio recording found for analysis");
};

/**
 * Fetch media from URL and convert to array buffer
 * @param {string} mediaUrl - URL of the media to fetch
 * @param {string} mediaType - Type of media (video/audio)
 * @returns {Promise<{buffer: Uint8Array, fileName: string}>} Media buffer and filename
 */
export const fetchMediaBuffer = async (mediaUrl, mediaType) => {
  try {
    logger.info(`Fetching ${mediaType} from URL: ${mediaUrl}`);

    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "MockVerse-MediaAnalysis/1.0",
      },
      // Add timeout for production
      signal: AbortSignal.timeout(300000), // 5 minutes timeout
    });

    if (!mediaResponse.ok) {
      throw new Error(
        `Failed to fetch ${mediaType}: ${mediaResponse.status} ${mediaResponse.statusText}`
      );
    }

    const mediaArrayBuffer = await mediaResponse.arrayBuffer();
    const mediaUint8Array = new Uint8Array(mediaArrayBuffer);

    // Extract filename from URL or use a default
    const fileName =
      mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1) ||
      `interview-${mediaType}.${mediaType === "video" ? "mp4" : "mp3"}`;

    logger.info(
      `${mediaType} fetched successfully. Size: ${mediaUint8Array.length} bytes`
    );

    return {
      buffer: mediaUint8Array,
      fileName: fileName.includes(".")
        ? fileName
        : `${fileName}.${mediaType === "video" ? "mp4" : "mp3"}`,
    };
  } catch (error) {
    logger.error(`Error fetching ${mediaType} from ${mediaUrl}:`, error);
    throw new ApiError(500, `Failed to fetch ${mediaType}: ${error.message}`);
  }
};

/**
 * Upload media to Google Files API
 * @param {Uint8Array} mediaBuffer - Media buffer
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type of the media
 * @returns {Promise<Object>} Uploaded file object
 */
export const uploadToGoogleFiles = async (mediaBuffer, fileName, mimeType) => {
  try {
    logger.info(`Uploading media to Google Files API: ${fileName}`);

    const genAI = getGenAIClient();
    let file = await genAI.files.upload({
      file: new Blob([mediaBuffer], { type: mimeType }),
      config: {
        mimeType: mimeType,
        displayName: fileName,
      },
    });

    logger.info(`Media uploaded with ID: ${file}`);

    while (file.state === "PROCESSING") {
      logger.info("Waiting for media to be processed by Google...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      file = await genAI.files.get({ name: file.name });
    }

    if (file.state === "FAILED") {
      throw new Error(
        `Google Files processing failed: ${file.error?.message || "Unknown error"}`
      );
    }

    if (!file.uri || !file.mimeType) {
      throw new Error("Failed to get valid file URI from Google Files API");
    }

    logger.info(`Media processing completed. URI: ${file.uri}`);
    return file;
  } catch (error) {
    logger.error("Error uploading to Google Files API:", error);
    throw new ApiError(
      500,
      `Failed to upload media to Google Files: ${error.message}`
    );
  }
};

/**
 * Analyze media using Google Gemini with structured output
 * @param {Object} file - Google Files API file object
 * @param {string} mediaType - Type of media (video/audio)
 * @param {string} interviewId - Interview ID for context
 * @returns {Promise<Object>} Structured analysis result
 */
export const analyzeMediaWithLLM = async (file, mediaType, interviewId) => {
  try {
    logger.info(`Starting ${mediaType} analysis for interview: ${interviewId}`);

    const genAI = getGenAIClient();

    // Get appropriate prompt and schema based on media type
    const prompt =
      mediaType === "video" ? videoAnalysisPrompt() : audioAnalysisPrompt();
    const responseSchema = getMediaAnalysisSchema(mediaType);

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: createUserContent([
        createPartFromUri(file.uri, file.mimeType),
        prompt,
      ]),
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const analysisText = result.text;
    let analysis;

    console.log(analysisText);

    try {
      analysis = JSON.parse(analysisText);
      logger.info(
        `${mediaType} analysis completed for interview: ${interviewId}`
      );
    } catch (parseError) {
      logger.error(`Failed to parse LLM response as JSON:`, parseError);
      throw new Error(`Invalid JSON response from LLM: ${parseError.message}`);
    }

    return analysis;
  } catch (error) {
    logger.error(
      `Error analyzing ${mediaType} for interview ${interviewId}:`,
      error
    );
    throw new ApiError(500, `Failed to analyze ${mediaType}: ${error.message}`);
  }
};

/**
 * Store analysis result in database
 * @param {string} interviewId - Interview ID
 * @param {Object} analysis - Structured analysis result
 * @param {Object} file - Google Files API file object
 * @param {string} mediaType - Type of media analyzed
 * @param {number} processingDuration - Processing time in milliseconds
 * @returns {Promise<Object>} Updated interview report document
 */
export const storeAnalysisResult = async (
  interviewId,
  analysis,
  mediaType,
  processingDuration
) => {
  try {
    logger.info(
      `Storing ${mediaType} analysis result for interview: ${interviewId}`
    );

    // First check if interview report exists
    const existingReport = await InterviewReport.findOne({ interviewId });

    if (!existingReport) {
      throw new Error(
        "Interview report not found. Report must be generated before media analysis."
      );
    }

    const updatedReport = await InterviewReport.findByIdAndUpdate(
      existingReport._id,
      {
        $set: {
          mediaAnalysis: {
            type: mediaType,
            analysis,
            analyzedAt: new Date(),
            isCompleted: true,
            processingDuration,
          },
        },
      },
      { new: true }
    );

    logger.info(
      `${mediaType} analysis result stored successfully for interview: ${interviewId}`
    );
    return updatedReport;
  } catch (error) {
    logger.error(
      `Error storing ${mediaType} analysis result for interview ${interviewId}:`,
      error
    );
    throw new ApiError(
      500,
      `Failed to store ${mediaType} analysis result: ${error.message}`
    );
  }
};

/**
 * Cleanup Google Files API file
 * @param {string} fileName - Google Files API file name
 */
export const cleanupGoogleFile = async (fileName) => {
  try {
    if (fileName) {
      const genAI = getGenAIClient();
      await genAI.fileManager.deleteFile(fileName);
      logger.info(`Cleaned up Google file: ${fileName}`);
    }
  } catch (error) {
    // Log but don't throw - cleanup is best effort
    logger.warn(`Failed to cleanup Google file ${fileName}:`, error.message);
  }
};

/**
 * Process complete media analysis workflow
 * @param {Object} jobData - Job data from queue
 * @param {string} jobData.interviewId - Interview ID
 * @param {string} jobData.userId - User ID
 * @returns {Promise<Object>} Processing result
 */
export const processMediaAnalysis = async (jobData) => {
  const { interviewId, userId } = jobData;
  let googleFile = null;
  const startTime = Date.now();

  try {
    logger.info(
      `Starting media analysis process for interview: ${interviewId}`
    );

    // Notify user that analysis has started
    emitToRoom(userId, `${EVENTS.ANALYSIS_STARTED}:${interviewId}`, {
      interviewId,
      message: "Media analysis has started",
      status: "processing",
    });

    // Step 1: Get interview and determine media type
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new Error(`Interview not found: ${interviewId}`);
    }

    const mediaInfo = determineMediaType(interview);
    logger.info(
      `Detected media type: ${mediaInfo.type} for interview: ${interviewId}`
    );

    // Step 2: Fetch media from URL
    const { buffer, fileName } = await fetchMediaBuffer(
      mediaInfo.url,
      mediaInfo.type
    );

    // Step 3: Upload to Google Files API
    googleFile = await uploadToGoogleFiles(
      buffer,
      fileName,
      mediaInfo.mimeType
    );

    // Step 4: Analyze with LLM using structured output
    const analysis = await analyzeMediaWithLLM(
      googleFile,
      mediaInfo.type,
      interviewId
    );

    // Step 5: Store result in database
    const processingDuration = Date.now() - startTime;
    const updatedInterview = await storeAnalysisResult(
      interviewId,
      analysis,
      mediaInfo.type,
      processingDuration
    );

    logger.info(
      `${mediaInfo.type} analysis completed successfully for interview: ${interviewId} in ${processingDuration}ms`
    );

    // Notify user that analysis is completed
    emitToRoom(userId, `${EVENTS.ANALYSIS_COMPLETED}:${interviewId}`, {
      interviewId,
      message: `${mediaInfo.type} analysis completed successfully`,
      status: "completed",
      mediaType: mediaInfo.type,
      analysis: {
        summary: analysis.summary,
        overallScore: analysis.summary?.overallScore,
        analyzedAt: new Date().toISOString(),
        fileSize: googleFile.sizeBytes,
        processingDuration,
      },
    });

    return {
      success: true,
      interviewId,
      mediaType: mediaInfo.type,
      analysis,
      fileUri: googleFile.uri,
      processingDuration,
      updatedInterview,
    };
  } catch (error) {
    const processingDuration = Date.now() - startTime;
    logger.error(`Media analysis failed for interview ${interviewId}:`, error);

    // Notify user that analysis failed
    emitToRoom(userId, `${EVENTS.ANALYSIS_FAILED}:${interviewId}`, {
      interviewId,
      message: "Media analysis failed",
      status: "failed",
      error: error.message,
      retryable: !error.message.includes("not found"), // Don't retry if interview/media not found
      failedAt: new Date().toISOString(),
      processingDuration,
    });

    // Cleanup uploaded file on error
    if (googleFile?.name) {
      await cleanupGoogleFile(googleFile.name);
    }

    // Store error in database for debugging
    try {
      const existingReport = await InterviewReport.findOne({ interviewId });
      if (existingReport) {
        await InterviewReport.findByIdAndUpdate(existingReport._id, {
          $set: {
            mediaAnalysis: {
              error: error.message,
              failedAt: new Date(),
              processingDuration,
            },
          },
        });
      }
    } catch (dbError) {
      logger.error(
        `Failed to store error in database for interview ${interviewId}:`,
        dbError
      );
    }

    throw error;
  }
};
