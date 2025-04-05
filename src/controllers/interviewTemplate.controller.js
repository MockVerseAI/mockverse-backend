import { google } from "@ai-sdk/google";
import { InterviewTemplate } from "../models/interviewTemplate.model.js";
import { InterviewTemplateRecommendation } from "../models/interviewTemplateRecommendation.model.js";
import { InterviewWorkspace } from "../models/interviewWorkspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAIStructuredResponse,
  getEmbedding,
} from "../utils/helpers.js";
import { interviewTemplateSelectionPrompt } from "../utils/prompts.js";
import { interviewTemplateSelectionSchema } from "../utils/schemas.js";

const createInterviewTemplate = asyncHandler(async (req, res) => {
  const { name, description, category, promptInsertions } = req.body;

  const embedding = await getEmbedding(`${name} ${description} ${category}`);

  const interviewTemplate = await InterviewTemplate.create({
    name,
    description,
    category,
    promptInsertions,
    embedding,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        interviewTemplate,
        "Interview template created successfully"
      )
    );
});

const getInterviewTemplates = asyncHandler(async (req, res) => {
  const { search = "", category = "", page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {
    isDeleted: false,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(category && { category: { $regex: category, $options: "i" } }),
  };

  const totalCount = await InterviewTemplate.countDocuments(query);

  const interviewTemplates = await InterviewTemplate.find(query)
    .select("name description category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        templates: interviewTemplates,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(totalCount / limitNumber),
        },
      },
      "Interview templates fetched successfully"
    )
  );
});

const deleteInterviewTemplate = asyncHandler(async (req, res) => {
  const { interviewTemplateId } = req.params;

  const interviewTemplate =
    await InterviewTemplate.findById(interviewTemplateId);

  if (!interviewTemplate) {
    throw new ApiError(404, "Interview template not found");
  }

  await InterviewTemplate.findByIdAndUpdate(interviewTemplateId, {
    isDeleted: true,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Interview template deleted successfully")
    );
});

const updateInterviewTemplate = asyncHandler(async (req, res) => {
  const { interviewTemplateId } = req.params;
  const { body } = req;

  const interviewTemplate = await InterviewTemplate.findOne({
    _id: interviewTemplateId,
    isDeleted: false,
  });

  if (!interviewTemplate) {
    throw new ApiError(404, "Interview template not found");
  }

  const updatedInterviewTemplate = await InterviewTemplate.findByIdAndUpdate(
    interviewTemplateId,
    { $set: body },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedInterviewTemplate,
        "Interview template updated successfully"
      )
    );
});

const findRelevantTemplate = asyncHandler(async (req, res) => {
  const { interviewWorkspaceId } = req.params;

  const [interviewWorkspace, interviewTemplateRecommendation] =
    await Promise.all([
      InterviewWorkspace.findById(interviewWorkspaceId),
      InterviewTemplateRecommendation.findOne({
        interviewWorkspaceId,
        isDeleted: false,
      }),
    ]);

  if (!interviewWorkspace || interviewWorkspace.isDeleted) {
    throw new ApiError(404, "Interview workspace not found");
  }

  if (interviewTemplateRecommendation) {
    console.log(interviewTemplateRecommendation);
    const interviewTemplate = await InterviewTemplate.findById(
      interviewTemplateRecommendation.interviewTemplateId
    );
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          templates: [interviewTemplate],
          recommendedDifficulty:
            interviewTemplateRecommendation.difficultyLevel,
        },
        "Relevant templates fetched successfully"
      )
    );
  }

  const { jobDescription, jobRole } = interviewWorkspace;

  const interviewTemplates = await InterviewTemplate.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $project: {
        embedding: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    },
  ]);

  const aiPrompt = interviewTemplateSelectionPrompt({
    jobRole,
    jobDescription,
    interviewTemplates,
  });

  const relevantTemplate = await generateAIStructuredResponse({
    schema: interviewTemplateSelectionSchema,
    prompt: aiPrompt,
    model: google("gemini-2.0-flash-lite"),
  });

  const { templates_id, difficulty_level } = relevantTemplate;

  // eslint-disable-next-line no-unused-vars
  const [template, _] = await Promise.all([
    InterviewTemplate.findById(templates_id),
    InterviewTemplateRecommendation.create({
      interviewTemplateId: templates_id,
      interviewWorkspaceId,
      difficultyLevel: difficulty_level,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        templates: [template],
        recommendedDifficulty: difficulty_level,
      },
      "Relevant templates fetched successfully"
    )
  );
});

export {
  createInterviewTemplate,
  deleteInterviewTemplate,
  findRelevantTemplate,
  getInterviewTemplates,
  updateInterviewTemplate,
};
