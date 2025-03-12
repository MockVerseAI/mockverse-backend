import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.model.js";
import { DeepgramKey } from "../models/deepgramKeys.model.js";
import { ApiError } from "../utils/ApiError.js";
import { createClient } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_MEMBER_API_KEY);

const getKey = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const { interviewId } = req.params;

  const [interview, existingKey] = await Promise.all([
    Interview.findById(interviewId),
    DeepgramKey.findOne({ interviewId, userId }),
  ]);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  if (interview.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this interview");
  }

  if (interview.isCompleted) {
    throw new ApiError(400, "Interview is completed");
  }

  // Check if existing key is still valid (5 minutes buffer before expiration)
  if (existingKey) {
    const expirationDate = new Date(
      existingKey.createdAt.getTime() + 15 * 60 * 1000
    );
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expirationDate > fiveMinutesFromNow) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, existingKey, "Deepgram key fetched successfully")
        );
    }

    // Delete expired key in background
    deleteExpiredKey(process.env.DEEPGRAM_PROJECT_ID, existingKey);
  }

  // Create new key
  const { result, error } = await deepgram.manage.createProjectKey(
    process.env.DEEPGRAM_PROJECT_ID,
    {
      comment: `Temporary transcription key - ${userEmail}`,
      scopes: ["usage:write"],
      time_to_live_in_seconds: 15 * 60,
    }
  );

  if (error) {
    throw new ApiError(500, error.message);
  }

  const newDeepgramKey = await DeepgramKey.create({
    key: result.key,
    api_key_id: result.api_key_id,
    interviewId,
    userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, newDeepgramKey, "Deepgram key created successfully")
    );
});

// Helper function to delete expired keys asynchronously
async function deleteExpiredKey(projectId, key) {
  try {
    await Promise.all([
      deepgram.manage.deleteProjectKey(projectId, key.api_key_id),
      DeepgramKey.findByIdAndDelete(key._id),
    ]);
  } catch (error) {
    console.error("Error deleting expired key:", error);
  }
}

export { getKey };
