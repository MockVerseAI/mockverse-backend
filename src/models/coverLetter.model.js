import mongoose, { Schema } from "mongoose";

const coverLetterSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Company name cannot exceed 100 characters"],
      minLength: [2, "Company name must be at least 2 characters"],
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Job role cannot exceed 100 characters"],
      minLength: [2, "Job role must be at least 2 characters"],
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
      maxLength: [5000, "Job description cannot exceed 5000 characters"],
      minLength: [10, "Job description must be at least 10 characters"],
    },
    generatedContent: {
      type: String,
      required: true,
      trim: true,
      maxLength: [3000, "Cover letter content cannot exceed 3000 characters"],
      minLength: [50, "Cover letter content must be at least 50 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    generationDuration: {
      type: Number, // in milliseconds
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
coverLetterSchema.index({ userId: 1, isDeleted: 1 });
coverLetterSchema.index({ resumeId: 1 });
// Compound index for duplicate checking
coverLetterSchema.index(
  { userId: 1, companyName: 1, jobRole: 1, resumeId: 1, isDeleted: 1 },
  { unique: true }
);

// Pre-save middleware to calculate word count
coverLetterSchema.pre("save", function (next) {
  if (this.isModified("generatedContent")) {
    this.wordCount = this.generatedContent
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
  next();
});

export const CoverLetter = mongoose.model("CoverLetter", coverLetterSchema);
