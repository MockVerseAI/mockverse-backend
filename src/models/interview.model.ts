import mongoose, { Schema, Model } from "mongoose";
import { InterviewDocument } from "../types/index.js";

// Interview schema definition
const interviewSchema = new Schema<InterviewDocument>(
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
    topic: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Interview model
export const Interview: Model<InterviewDocument> =
  mongoose.model<InterviewDocument>("Interview", interviewSchema);
