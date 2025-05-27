import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { ApiError } from "../utils/ApiError.js";

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
 * Fetch video from URL and convert to array buffer
 * @param {string} videoUrl - URL of the video to fetch
 * @returns {Promise<{buffer: Uint8Array, fileName: string}>} Video buffer and filename
 */
export const fetchVideoBuffer = async (videoUrl) => {
  try {
    logger.info(`Fetching video from URL: ${videoUrl}`);

    const videoResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent": "MockVerse-VideoAnalysis/1.0",
      },
      // Add timeout for production
      signal: AbortSignal.timeout(300000), // 5 minutes timeout
    });

    if (!videoResponse.ok) {
      throw new Error(
        `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const contentLength = videoResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
      throw new Error("Video file too large (max 100MB)");
    }

    const videoArrayBuffer = await videoResponse.arrayBuffer();
    const videoUint8Array = new Uint8Array(videoArrayBuffer);

    // Extract filename from URL or use a default
    const fileName =
      videoUrl.substring(videoUrl.lastIndexOf("/") + 1) ||
      "interview-video.mp4";

    logger.info(
      `Video fetched successfully. Size: ${videoUint8Array.length} bytes`
    );

    return {
      buffer: videoUint8Array,
      fileName: fileName.includes(".") ? fileName : `${fileName}.mp4`,
    };
  } catch (error) {
    logger.error(`Error fetching video from ${videoUrl}:`, error);
    throw new ApiError(500, `Failed to fetch video: ${error.message}`);
  }
};

/**
 * Upload video to Google Files API
 * @param {Uint8Array} videoBuffer - Video buffer
 * @param {string} fileName - File name
 * @returns {Promise<Object>} Uploaded file object
 */
export const uploadToGoogleFiles = async (videoBuffer, fileName) => {
  try {
    logger.info(`Uploading video to Google Files API: ${fileName}`);

    const genAI = getGenAIClient();
    const uploadResult = await genAI.files.upload({
      file: new Blob([videoBuffer], { type: "video/mp4" }),
      config: {
        mimeType: "video/mp4",
        displayName: fileName,
      },
    });

    logger.info(`Video uploaded with ID: ${uploadResult.file}`);

    // Wait for processing to complete
    let file = uploadResult.file;
    while (file.state === "PROCESSING") {
      logger.info("Waiting for video to be processed by Google...");
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

    logger.info(`Video processing completed. URI: ${file.uri}`);
    return file;
  } catch (error) {
    logger.error("Error uploading to Google Files API:", error);
    throw new ApiError(
      500,
      `Failed to upload video to Google Files: ${error.message}`
    );
  }
};

/**
 * Analyze video using Google Gemini
 * @param {Object} file - Google Files API file object
 * @param {string} interviewId - Interview ID for context
 * @returns {Promise<string>} Analysis result
 */
export const analyzeVideoWithLLM = async (file, interviewId) => {
  try {
    logger.info(`Starting video analysis for interview: ${interviewId}`);

    const genAI = getGenAIClient();

    const prompt = `
      You are an expert interview analyst. Please analyze this interview video and provide a comprehensive assessment.

      Focus on the following areas:
      1. **Communication Skills**: Clarity, articulation, pace, and confidence
      2. **Body Language**: Posture, eye contact, gestures, and overall presence
      3. **Technical Content**: If applicable, assess technical knowledge and explanations
      4. **Interview Performance**: Overall professionalism, engagement, and interview readiness
      5. **Areas for Improvement**: Specific feedback and recommendations

      Please provide:
      - A summary of the interview performance
      - Key strengths observed
      - Areas that need improvement
      - Specific actionable recommendations
      - A confidence/readiness score out of 10

      Format your response in a structured manner with clear sections and bullet points where appropriate.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: createUserContent([
        createPartFromUri(file.uri, file.mimeType),
        prompt,
      ]),
    });

    const analysis = result.text;
    logger.info(`Video analysis completed for interview: ${interviewId}`);

    return analysis;
  } catch (error) {
    logger.error(`Error analyzing video for interview ${interviewId}:`, error);
    throw new ApiError(500, `Failed to analyze video: ${error.message}`);
  }
};

/**
 * Store analysis result in database
 * @param {string} interviewId - Interview ID
 * @param {string} analysis - Analysis result
 * @param {Object} file - Google Files API file object
 * @returns {Promise<Object>} Updated interview report document
 */
export const storeAnalysisResult = async (interviewId, analysis, file) => {
  try {
    logger.info(`Storing analysis result for interview: ${interviewId}`);

    // First check if interview report exists
    const existingReport = await InterviewReport.findOne({ interviewId });

    if (!existingReport) {
      throw new Error(
        "Interview report not found. Report must be generated before video analysis."
      );
    }

    const updatedReport = await InterviewReport.findByIdAndUpdate(
      existingReport._id,
      {
        $set: {
          videoAnalysis: {
            analysis,
            googleFileUri: file.uri,
            googleFileName: file.displayName,
            analyzedAt: new Date(),
            fileSize: file.sizeBytes,
          },
        },
      },
      { new: true }
    );

    logger.info(
      `Analysis result stored successfully for interview: ${interviewId}`
    );
    return updatedReport;
  } catch (error) {
    logger.error(
      `Error storing analysis result for interview ${interviewId}:`,
      error
    );
    throw new ApiError(
      500,
      `Failed to store analysis result: ${error.message}`
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
 * Process complete video analysis workflow
 * @param {Object} jobData - Job data from queue
 * @param {string} jobData.interviewId - Interview ID
 * @param {string} jobData.userId - User ID
 * @returns {Promise<Object>} Processing result
 */
export const processVideoAnalysis = async (jobData) => {
  const { interviewId } = jobData;
  let googleFile = null;

  try {
    logger.info(
      `Starting video analysis process for interview: ${interviewId}`
    );

    // Step 1: Get video URL from interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new Error(`Interview not found: ${interviewId}`);
    }

    const videoUrl = interview.recordings?.video;
    if (!videoUrl) {
      throw new Error(`No video recording found for interview: ${interviewId}`);
    }

    // Step 2: Fetch video from URL
    const { buffer, fileName } = await fetchVideoBuffer(videoUrl);

    // Step 3: Upload to Google Files API
    googleFile = await uploadToGoogleFiles(buffer, fileName);

    // Step 4: Analyze with LLM
    const analysis = await analyzeVideoWithLLM(googleFile, interviewId);

    // Step 5: Store result in database
    const updatedInterview = await storeAnalysisResult(
      interviewId,
      analysis,
      googleFile
    );

    logger.info(
      `Video analysis completed successfully for interview: ${interviewId}`
    );

    return {
      success: true,
      interviewId,
      analysis,
      fileUri: googleFile.uri,
      updatedInterview,
    };
  } catch (error) {
    logger.error(`Video analysis failed for interview ${interviewId}:`, error);

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
            videoAnalysis: {
              error: error.message,
              failedAt: new Date(),
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
