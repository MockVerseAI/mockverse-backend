import logger from "../logger/winston.logger.js";
import { CoverLetter } from "../models/coverLetter.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse } from "../utils/helpers.js";
import { escapeRegex } from "../utils/lib.js";
import { coverLetterPrompt } from "../utils/prompts.js";

/**
 * @description Generate a new cover letter using AI
 * @route POST /api/v1/cover-letter
 * @access Private
 */
const generateCoverLetter = asyncHandler(async (req, res) => {
  const { companyName, jobRole, jobDescription, resumeId } = req.body;
  const userId = req.user._id;

  const start = performance.now();

  const resume = await Resume.findOne({
    _id: resumeId,
    userId: userId,
    isDeleted: false,
  });

  if (!resume) {
    throw new ApiError(400, "Resume not found or does not belong to user");
  }

  // Check if a cover letter already exists for this company and role
  const existingCoverLetter = await CoverLetter.findOne({
    userId,
    companyName: { $regex: new RegExp(`^${escapeRegex(companyName)}$`, "i") },
    jobRole: { $regex: new RegExp(`^${escapeRegex(jobRole)}$`, "i") },
    isDeleted: false,
    resumeId,
  });

  if (existingCoverLetter) {
    logger.info(`Existing cover letter found for user ${userId}`, {
      coverLetterId: existingCoverLetter._id,
      companyName,
      jobRole,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...existingCoverLetter.toObject(),
          alreadyExists: true,
        },
        "Cover letter already exists for this position"
      )
    );
  }

  try {
    // Generate AI cover letter
    const aiPrompt = coverLetterPrompt({
      companyName,
      jobRole,
      jobDescription,
      parsedResume: resume.parsedContent,
    });

    const generatedContent = await generateAIResponse({
      messages: [{ role: "user", content: aiPrompt }],
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Validate AI generated content
    if (!generatedContent || generatedContent.trim().length < 50) {
      throw new ApiError(
        500,
        "AI failed to generate valid cover letter content"
      );
    }

    const generationEnd = performance.now();
    const generationDuration = Math.round(generationEnd - start);

    // Save to database
    const coverLetter = await CoverLetter.create({
      userId,
      resumeId,
      companyName,
      jobRole,
      jobDescription,
      generatedContent,
      generationDuration,
    });

    logger.info("Cover letter generated successfully", {
      coverLetterId: coverLetter._id,
      userId,
      companyName,
      jobRole,
      generationDuration,
      wordCount: coverLetter.wordCount,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          ...coverLetter.toObject(),
          alreadyExists: false,
        },
        "Cover letter generated successfully"
      )
    );
  } catch (error) {
    logger.error("Error generating cover letter:", {
      error: error.message,
      stack: error.stack,
      userId,
      companyName,
      jobRole,
      resumeId,
    });

    // Preserve original error for debugging while providing user-friendly message
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to generate cover letter. Please try again.",
      error
    );
  }
});

/**
 * @description Get all cover letters for the authenticated user
 * @route GET /api/v1/cover-letter
 * @access Private
 */
const getCoverLetters = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, search = "" } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Build search query
  const searchQuery = {
    userId,
    isDeleted: false,
  };

  const escapedSearch = escapeRegex(search);

  if (escapedSearch) {
    searchQuery.$or = [
      { companyName: { $regex: escapedSearch, $options: "i" } },
      { jobRole: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  // Get cover letters with pagination
  const [coverLetters, totalCount] = await Promise.all([
    CoverLetter.find(searchQuery)
      .populate("resumeId", "fileName")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    CoverLetter.countDocuments(searchQuery),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: coverLetters,
        total: totalCount,
      },
      "Cover letters fetched successfully"
    )
  );
});

/**
 * @description Get a specific cover letter by ID
 * @route GET /api/v1/cover-letter/:id
 * @access Private
 */
const getCoverLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const coverLetter = await CoverLetter.findOne({
    _id: id,
    userId: userId,
    isDeleted: false,
  }).populate("resumeId", "fileName url");

  if (!coverLetter) {
    throw new ApiError(404, "Cover letter not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, coverLetter, "Cover letter fetched successfully")
    );
});

/**
 * @description Delete a cover letter (soft delete)
 * @route DELETE /api/v1/cover-letter/:id
 * @access Private
 */
const deleteCoverLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const coverLetter = await CoverLetter.findOneAndUpdate(
    {
      _id: id,
      userId: userId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true }
  );

  if (!coverLetter) {
    throw new ApiError(404, "Cover letter not found");
  }

  logger.info("Cover letter deleted successfully", {
    coverLetterId: coverLetter._id,
    userId,
    companyName: coverLetter.companyName,
    jobRole: coverLetter.jobRole,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: coverLetter._id },
        "Cover letter deleted successfully"
      )
    );
});

export {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
};
