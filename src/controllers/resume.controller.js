import fs from "fs";
import PdfParse from "pdf-parse/lib/pdf-parse.js";
import logger from "../logger/winston.logger.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getLocalPath, groq, removeLocalFile } from "../utils/helpers.js";
import { getHash } from "../utils/lib.js";
import { resumeParsePrompt } from "../utils/prompts.js";

const createResume = asyncHandler(async (req, res) => {
  const file = req.file;

  const localPath = getLocalPath(file?.filename);
  const pdfBuffer = fs.readFileSync(localPath);
  removeLocalFile(localPath);

  const { text: resumeContent } = await PdfParse(pdfBuffer);
  const hash = getHash(`${resumeContent}-${req?.user?._id}`);

  const existingResume = await Resume.findOne({ hash });

  if (existingResume) {
    logger.info("existing resume found");
    return res
      .status(201)
      .json(
        new ApiResponse(200, existingResume, "Resume successfully created")
      );
  }

  const groqResponse = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: resumeParsePrompt,
      },
      {
        role: "user",
        content: `Here is the resume text: ${resumeContent}`,
      },
    ],
    model: "llama3-70b-8192",
  });

  const parsedContent = groqResponse.choices[0].message.content;

  logger.info("LLM called");

  const newResume = await Resume.create({
    content: resumeContent,
    hash,
    parsedContent,
    userId: req?.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, newResume, "Resume successfully created"));
});

const deleteResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resume = await Resume.findOneAndDelete({
    _id: id,
    userId: req.user?.id,
  });

  if (!resume) {
    throw new ApiError(404, "Resume does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resume, "Resume successfully deleted"));
});

export { createResume, deleteResume };