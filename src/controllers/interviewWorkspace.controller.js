import { InterviewWorkspace } from "../models/interviewWorkspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createInterviewWorkspace = asyncHandler(async (req, res) => {
  const { companyName, jobRole, jobDescription } = req.body;

  const interviewWorkspace = await InterviewWorkspace.create({
    companyName,
    jobRole,
    jobDescription,
    userId: req.user?._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        interviewWorkspace,
        "Interview workspace created successfully"
      )
    );
});

const getAllInterviewWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const interviewWorkspaces = await InterviewWorkspace.find({ userId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interviewWorkspaces,
        "Interview workspaces fetched successfully"
      )
    );
});

const deleteInterviewWorkspace = asyncHandler(async (req, res) => {
  const { interviewWorkspaceId } = req.params;

  const interviewWorkspace =
    await InterviewWorkspace.findById(interviewWorkspaceId);

  if (!interviewWorkspace) {
    throw new ApiError(404, "Interview workspace not found");
  }

  if (interviewWorkspace.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this interview workspace"
    );
  }

  await InterviewWorkspace.findByIdAndUpdate(interviewWorkspaceId, {
    isDeleted: true,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Interview workspace deleted successfully")
    );
});

export {
  createInterviewWorkspace,
  deleteInterviewWorkspace,
  getAllInterviewWorkspaces,
};
