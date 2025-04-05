import mongoose, { Schema } from "mongoose";

const interviewTemplateRecommendationSchema = new Schema(
  {
    interviewWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewWorkspace",
      required: true,
      index: true,
    },
    interviewTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewTemplate",
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

interviewTemplateRecommendationSchema.index({
  interviewWorkspaceId: 1,
  isDeleted: 1,
});

export const InterviewTemplateRecommendation = mongoose.model(
  "InterviewTemplateRecommendation",
  interviewTemplateRecommendationSchema
);
