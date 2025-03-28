import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { InterviewReport } from "../models/interviewReport.model.js";
import { InterviewTemplate } from "../models/interviewTemplate.model.js";
import { InterviewWorkspace } from "../models/interviewWorkspace.model.js";
import { Message } from "../models/message.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAIResponse,
  generateAIStructuredResponse,
  generateSpeech,
} from "../utils/helpers.js";
import {
  baseInterviewPrompt,
  interviewReportGeneratePrompt,
} from "../utils/prompts.js";
import { interviewReportSchema } from "../utils/schemas.js";

const setupInterview = asyncHandler(async (req, res) => {
  const { interviewWorkspaceId } = req.params;
  const { resumeId, interviewTemplateId, difficulty, duration } = req.body;

  const [
    existingResume,
    existingInterviewTemplate,
    existingInterviewWorkspace,
  ] = await Promise.all([
    Resume.find({
      _id: resumeId,
      userId: req?.user?._id,
      isDeleted: false,
    }),
    InterviewTemplate.find({
      _id: interviewTemplateId,
      isDeleted: false,
    }),
    InterviewWorkspace.find({
      _id: interviewWorkspaceId,
      userId: req?.user?._id,
      isDeleted: false,
    }),
  ]);

  if (!existingResume) {
    throw new ApiError(400, "Resume provided is invalid");
  }

  if (!existingInterviewTemplate) {
    throw new ApiError(400, "Interview template provided is invalid");
  }

  if (!existingInterviewWorkspace) {
    throw new ApiError(400, "Interview workspace provided is invalid");
  }

  const interview = await Interview.create({
    resumeId,
    userId: req.user?._id,
    interviewWorkspaceId,
    interviewTemplateId,
    difficulty,
    duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, interview, "Interview setup successfully"));
});

const chat = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { message, isFirst } = req.body;

  const [messages, interview] = await Promise.all([
    Message.find({ interviewId })
      .select("content role createdAt -_id")
      .sort({ createdAt: 1 }),
    Interview.findById(interviewId)
      .populate("resumeId")
      .populate("interviewWorkspaceId")
      .populate("interviewTemplateId"),
  ]);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const aiPrompt = baseInterviewPrompt(interview.interviewTemplateId, {
    companyName: interview.interviewWorkspaceId.companyName,
    jobRole: interview.interviewTemplateId.jobRole,
    jobDescription: interview.interviewTemplateId.jobDescription,
    parsedResume: interview.resumeId.parsedContent,
    duration: interview.duration.toString(),
    difficulty: interview.difficulty,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let aiResponse, statusCode, responseMessage;

    if (isFirst) {
      if (messages.length > 0) {
        await session.commitTransaction();
        return res
          .status(200)
          .json(
            new ApiResponse(200, messages, "Interview is already initialized")
          );
      }

      aiResponse = await generateAIResponse({
        systemPrompt: aiPrompt,
      });

      await Message.create(
        [
          {
            content: aiResponse,
            interviewId,
            role: "assistant",
            userId: req?.user?._id,
          },
        ],
        { session }
      );

      statusCode = 201;
      responseMessage = "Interview setup successfully";
    } else {
      const formattedMessages = messages.map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const allMessages = [
        ...formattedMessages,
        { content: message, role: "user" },
      ];

      await Message.create(
        [
          {
            content: message,
            interviewId,
            role: "user",
            userId: req?.user?._id,
          },
        ],
        { session }
      );

      aiResponse = await generateAIResponse({
        systemPrompt: aiPrompt,
        messages: allMessages,
      });

      await Message.create(
        [
          {
            content: aiResponse,
            interviewId,
            role: "assistant",
            userId: req?.user?._id,
          },
        ],
        { session }
      );

      statusCode = 201;
      responseMessage = "Message processed successfully";
    }

    const speechBuffer = await generateSpeech(aiResponse);
    const audio = speechBuffer ? speechBuffer.toString("base64") : null;

    await session.commitTransaction();

    return res
      .status(statusCode)
      .json(
        new ApiResponse(
          statusCode,
          { content: aiResponse, audio, role: "assistant" },
          responseMessage
        )
      );
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error in chat controller:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  } finally {
    session.endSession();
  }
});

const getAllInterviews = asyncHandler(async (req, res) => {
  const { interviewWorkspaceId } = req.params;
  const userId = req.user._id;

  const interviews = await Interview.find({
    userId,
    interviewWorkspaceId,
  })
    .sort({
      createdAt: -1,
    })
    .populate("interviewTemplateId", "name category description");

  return res
    .status(200)
    .json(new ApiResponse(200, interviews, "Interviews fetched successfully"));
});

const endInterview = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const [messages, interview] = await Promise.all([
    Message.find({ interviewId })
      .select("content role createdAt -_id")
      .sort({ createdAt: 1 }),
    Interview.findById(interviewId),
  ]);

  if (messages.length < 10)
    throw new ApiError(
      409,
      "Interview is too short. Please continue with the interview."
    );

  if (interview.isCompleted)
    throw new ApiError(400, "Interview has already ended");

  await Interview.findByIdAndUpdate(interviewId, {
    isCompleted: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview ended successfully"));
});

const getOrGenerateReport = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  const [messages, interview] = await Promise.all([
    Message.find({ interviewId })
      .select("content role createdAt -_id")
      .sort({ createdAt: 1 }),
    Interview.findById(interviewId)
      .populate("resumeId")
      .populate("interviewWorkspaceId")
      .populate("interviewTemplateId"),
  ]);

  if (!interview) throw new ApiError(404, "Interview not found");

  if (!interview.isCompleted)
    throw new ApiError(409, "Interview is not completed");

  const formattedMessages = messages.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const existingInterviewReport = await InterviewReport.findOne({
    interviewId,
  });

  if (existingInterviewReport) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          interviewReport: existingInterviewReport.toObject(),
          messages: formattedMessages,
          interview,
        },
        "Interview report fetched successfully"
      )
    );
  }

  const aiPrompt = interviewReportGeneratePrompt({
    jobRole: interview.jobRole,
    jobDescription: interview.jobDescription,
    parsedResume: interview.resumeId.parsedContent,
    conversation: JSON.stringify(formattedMessages),
  });

  const aiResponse = await generateAIStructuredResponse({
    prompt: aiPrompt,
    schema: interviewReportSchema,
    maxTokens: 10000,
  });

  const interviewReport = await InterviewReport.create({
    technicalAssessment: aiResponse.technicalAssessment,
    behavioralAnalysis: aiResponse.behavioralAnalysis,
    responseQuality: aiResponse.responseQuality,
    roleAlignment: aiResponse.roleAlignment,
    performanceMetrics: aiResponse.performanceMetrics,
    developmentPlan: aiResponse.developmentPlan,
    userId: req.user._id,
    interviewId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { interviewReport, messages: formattedMessages, interview },
        "Interview report generated successfully"
      )
    );
});

export {
  chat,
  endInterview,
  getAllInterviews,
  getOrGenerateReport,
  setupInterview,
};
