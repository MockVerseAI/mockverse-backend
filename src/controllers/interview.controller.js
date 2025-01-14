import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { Message } from "../models/message.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse } from "../utils/helpers.js";
import {
  initialInterviewPrompt,
  interviewReportGeneratePrompt,
} from "../utils/prompts.js";
import { InterviewReport } from "../models/interviewReport.model.js";

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
    .json(new ApiResponse(200, interview, "Interview setup successfully"));
});

const chat = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const { message, isFirst } = req.body;

  const [messages, interview] = await Promise.all([
    Message.find({ interviewId })
      .select("content role createdAt -_id")
      .sort({ createdAt: 1 }),
    Interview.findById(interviewId).populate("resumeId"),
  ]);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const aiPrompt = initialInterviewPrompt({
    jobRole: interview.jobRole,
    jobDescription: interview.jobDescription,
    parsedResume: interview.resumeId.parsedContent,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (isFirst) {
      if (messages.length > 0) {
        await session.commitTransaction();
        session.endSession();

        return res
          .status(200)
          .json(
            new ApiResponse(200, messages, "Interview is already initialized")
          );
      }

      const initialMessages = [
        {
          role: "system",
          content: aiPrompt,
        },
      ];

      const aiResponse = await generateAIResponse({
        messages: initialMessages,
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

      await session.commitTransaction();
      session.endSession();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { content: aiResponse, role: "assistant" },
            "Interview setup successfully"
          )
        );
    }

    const formattedMessages = messages.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const allMessages = [
      { content: aiPrompt, role: "system" },
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

    const aiResponse = await generateAIResponse({ messages: allMessages });

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

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { content: aiResponse, role: "assistant" },
          "Message processed successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error in chat controller:", error);

    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

const getAllInterviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const interviews = await Interview.find({ userId });

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
    Interview.findById(interviewId).populate("resumeId"),
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

  console.log(aiPrompt);

  const aiMessages = [
    {
      role: "system",
      content: aiPrompt,
    },
  ];

  const aiResponse = await generateAIResponse({
    messages: aiMessages,
    jsonMode: true,
  });

  const parsedResponse = JSON.parse(aiResponse);

  const interviewReport = await InterviewReport.create({
    areasOfImprovement: parsedResponse.areasOfImprovement,
    strengths: parsedResponse.strengths,
    overallFeel: parsedResponse.overallFeel,
    interviewScore: parsedResponse.interviewScore,
    userId: req.user._id,
    interviewId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { interviewReport, messages: formattedMessages },
        "Interview report generated successfully"
      )
    );
});

export {
  chat,
  setupInterview,
  getAllInterviews,
  endInterview,
  getOrGenerateReport,
};
