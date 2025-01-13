import mongoose, { Schema } from "mongoose";

const interviewReportSchema = new Schema(
  {
    areasOfImprovement: {
      type: [String],
      required: true,
      trim: true,
    },
    strengths: {
      type: [String],
      required: true,
      trim: true,
    },
    overallFeel: {
      type: String,
      required: true,
      trim: true,
    },
    interviewScore: {
      type: String,
      required: true,
      trim: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
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

interviewReportSchema.index({ interviewId: 1 });

export const InterviewReport = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);
