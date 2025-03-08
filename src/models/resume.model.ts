import mongoose, { Schema, Model } from "mongoose";
import { ResumeDocument } from "../types/index.js";

// Resume schema definition
const resumeSchema = new Schema<ResumeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Resume model
export const Resume: Model<ResumeDocument> = mongoose.model<ResumeDocument>(
  "Resume",
  resumeSchema
);
