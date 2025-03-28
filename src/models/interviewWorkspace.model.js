import mongoose, { Schema } from "mongoose";

const interviewWorkspaceSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    embedding: {
      type: [Number],
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

interviewWorkspaceSchema.index({ userId: 1 });

export const InterviewWorkspace = mongoose.model(
  "InterviewWorkspace",
  interviewWorkspaceSchema
);
