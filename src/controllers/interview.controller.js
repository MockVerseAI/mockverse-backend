import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";
import { Interview } from "../models/interview.model.js";
import { Message } from "../models/message.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIResponse } from "../utils/helpers.js";
import { initialInterviewPrompt } from "../utils/prompts.js";

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
  const { message, isFirst, interviewId } = req.body;

  const [messages, interview] = await Promise.all([
    Message.find({ interviewId }).select("content role -_id"),
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

      const aiResponse = await generateAIResponse(initialMessages);

      await Message.create(
        [
          {
            content: aiResponse,
            interviewId,
            role: "system",
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
            { content: aiResponse, role: "system" },
            "Interview setup successfully"
          )
        );
    }

    const allMessages = [{ content: aiPrompt, role: "system" }, ...messages];

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

    const aiResponse = await generateAIResponse(allMessages);

    await Message.create(
      [
        {
          content: aiResponse,
          interviewId,
          role: "system",
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
          { content: aiResponse, role: "system" },
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
  const { interviewId } = req.body;

  const interview = await Interview.findById(interviewId);

  if (interview.isCompleted) {
    throw new ApiError(400, "Interview has already ended");
  }

  await Interview.findByIdAndUpdate(interviewId, {
    isCompleted: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview ended successfully"));
});

export { chat, setupInterview, getAllInterviews, endInterview };
