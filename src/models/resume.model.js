import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    hash: {
      type: String,
      required: true,
      trim: true,
    },
    parsedContent: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ hash: 1 });
resumeSchema.index({ _id: 1, userId: 1 });

export const Resume = mongoose.model("Resume", resumeSchema);
