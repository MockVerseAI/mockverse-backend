import fs from "fs";
import Groq from "groq-sdk";
import PdfParse from "pdf-parse/lib/pdf-parse.js";
import { Interview } from "../models/interview.model.js";
import { ApiResponse } from "../utils/ApiResponse.js ";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getLocalPath, removeLocalFile } from "../utils/helpers.js";
import { resumeParsePrompt } from "../utils/prompts.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const setupInterview = asyncHandler(async (req, res) => {
  const { jobRole, jobDescription } = req.body;
  const file = req.file;

  const localPath = getLocalPath(file?.filename);

  const pdfBuffer = fs.readFileSync(localPath);
  const resume = await PdfParse(pdfBuffer);

  const resumeContent = resume.text;

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
    model: "llama-3.3-70b-specdec",
  });

  const parsedContent = groqResponse.choices[0].message.content;

  const interview = await Interview.create({
    jobRole,
    jobDescription,
    resume: parsedContent,
    userId: req.user?._id,
  });

  removeLocalFile(localPath);

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { data: interview },
        "Interview is setup successfully"
      )
    );
});

export { setupInterview };
