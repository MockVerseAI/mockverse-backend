import { Application } from "../models/application.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllApplications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const applications = await Application.find({ userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, applications, "Applications fetched successfully")
    );
});

const createApplication = asyncHandler(async (req, res) => {
  const { companyName, jobRole, jobDescription, resumeId } = req.body;

  const existingResume = await Resume.find({
    _id: resumeId,
    userId: req?.user?._id,
  });

  if (!existingResume) {
    throw new ApiError(400, "Resume provided is invalid");
  }

  const application = await Application.create({
    companyName,
    jobRole,
    jobDescription,
    resumeId,
    userId: req.user?._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(200, application, "Application created successfully")
    );
});

export { getAllApplications, createApplication };
