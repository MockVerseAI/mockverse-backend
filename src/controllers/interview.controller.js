import { Interview } from "../models/interview.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";

const setupInterview = asyncHandler(async (req, res) => {
  const { jobRole, jobDescription, resumeId } = req.body;

  const existingResume = await Resume.find({
    _id: resumeId,
    userId: req?.user?._id,
  });

  if (!existingResume) {
    throw new ApiError(400, "Resume provided is invalid");
  }

  const interview = await Interview.create({
    jobRole,
    jobDescription,
    resumeId,
    userId: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, interview, "Interview is setup successfully"));
});

export { setupInterview };
