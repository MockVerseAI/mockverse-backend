import { Application } from "../models/application.model.js";
import { ApplicationFeedback } from "../models/applicationFeedback.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse } from "../utils/helpers.js";
import { applicationFeedbackPrompt } from "../utils/prompts.js";

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

const getOrGenerateApplicationFeedback = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const application =
    await Application.findById(applicationId).populate("resumeId");

  if (!application) throw new ApiError(404, "Application not found");

  const existingApplicationFeedback = await ApplicationFeedback.findOne({
    applicationId,
  });

  if (existingApplicationFeedback) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          applicationFeedback: existingApplicationFeedback.toObject(),
          application,
        },
        "Application feedback fetched successfully"
      )
    );
  }

  const aiPrompt = applicationFeedbackPrompt({
    companyName: application.companyName,
    jobRole: application.jobRole,
    jobDescription: application.jobDescription,
    parsedResume: application.resumeId.parsedContent,
  });

  const messages = [
    {
      role: "system",
      content: aiPrompt,
    },
  ];

  const aiResponse = await generateAIResponse({
    messages,
    jsonMode: true,
    max_completion_tokens: 2048,
  });

  const parsedResponse = JSON.parse(aiResponse);

  const applicationFeedback = await ApplicationFeedback.create({
    core_alignment_analysis: parsedResponse.core_alignment_analysis,
    keyword_optimization: parsedResponse.keyword_optimization,
    experience_enhancement: parsedResponse.experience_enhancement,
    skills_optimization: parsedResponse.skills_optimization,
    impact_metrics: parsedResponse.impact_metrics,
    professional_narrative: parsedResponse.professional_narrative,
    competitive_advantages: parsedResponse.competitive_advantages,
    industry_alignment: parsedResponse.industry_alignment,
    action_priorities: parsedResponse.action_priorities,
    userId: req.user._id,
    applicationId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { applicationFeedback, application },
        "Application feedback generated successfully"
      )
    );
});

export {
  createApplication,
  getAllApplications,
  getOrGenerateApplicationFeedback,
};
