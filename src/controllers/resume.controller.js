import fs from "fs";
import logger from "../logger/winston.logger.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAIContentFromPDF,
  generateAIResponse,
  getLocalPath,
  removeLocalFile,
} from "../utils/helpers.js";
import { getHash } from "../utils/lib.js";
import { resumeParsePrompt, resumeSummaryPrompt } from "../utils/prompts.js";
import { upload } from "../utils/upload.js";

const createResume = asyncHandler(async (req, res) => {
  const file = req.file;

  const localPath = getLocalPath(file?.filename);
  const pdfBuffer = fs.readFileSync(localPath);

  const hash = getHash(`${pdfBuffer}-${req?.user?._id}`);

  const existingResume = await Resume.findOne({ hash, isDeleted: false });

  if (existingResume) {
    removeLocalFile(localPath);
    logger.info("existing resume found");
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { ...existingResume.toObject(), alreadyExists: true },
          "Resume already exists"
        )
      );
  }

  const fileKey = `resume/${Date.now()}-${file.originalname}`;

  const [fileUrl, parsedContent] = await Promise.all([
    upload(file, fileKey),
    generateAIContentFromPDF(pdfBuffer, resumeParsePrompt),
  ]);

  const summary = await generateAIResponse({
    systemPrompt: resumeSummaryPrompt,
    messages: [
      {
        role: "user",
        content: parsedContent,
      },
    ],
  });

  logger.info("LLM called");

  const newResume = await Resume.create({
    fileName: file?.originalname,
    url: fileUrl,
    hash,
    parsedContent,
    summary,
    userId: req?.user?._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { ...newResume.toObject(), alreadyExists: false },
        "Resume successfully created"
      )
    );
});

const deleteResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resume = await Resume.findByIdAndUpdate(
    {
      _id: id,
      userId: req.user?.id,
      isDeleted: false,
    },
    { isDeleted: true }
  );

  if (!resume) {
    throw new ApiError(404, "Resume does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resume, "Resume successfully deleted"));
});

const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({
    userId: req.user?.id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, resumes, "Resumes fetched successfully"));
});

export { createResume, deleteResume, getResumes };
