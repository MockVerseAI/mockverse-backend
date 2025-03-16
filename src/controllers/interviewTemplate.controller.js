import { InterviewTemplate } from "../models/interviewTemplate.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createInterviewTemplate = asyncHandler(async (req, res) => {
  const { name, description, category, promptInsertions } = req.body;

  const interviewTemplate = await InterviewTemplate.create({
    name,
    description,
    category,
    promptInsertions,
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
  const { search, category } = req.query;

  const interviewTemplates = await InterviewTemplate.find({
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(category && { category: { $regex: category, $options: "i" } }),
  }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        interviewTemplates,
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

  const interviewTemplate =
    await InterviewTemplate.findById(interviewTemplateId);

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

export {
  createInterviewTemplate,
  deleteInterviewTemplate,
  getInterviewTemplates,
  updateInterviewTemplate,
};
