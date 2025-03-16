import mongoose from "mongoose";
const { Schema } = mongoose;

const interviewTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["technical", "behavioral", "system-design", "hr", "mixed"],
      default: "technical",
    },
    promptInsertions: {
      type: Object,
      required: true,
      introduction: {
        type: Object,
        required: true,
        beginner: {
          type: String,
          required: true,
        },
        intermediate: {
          type: String,
          required: true,
        },
        advanced: {
          type: String,
          required: true,
        },
        expert: {
          type: String,
          required: true,
        },
      },
      interviewStructure: {
        type: Object,
        required: true,
        15: {
          type: String,
          required: true,
        },
        30: {
          type: String,
          required: true,
        },
        45: {
          type: String,
          required: true,
        },
        60: {
          type: String,
          required: true,
        },
      },
      questionCategories: {
        type: Object,
        required: true,
        beginner: {
          type: [String],
          required: true,
        },
        intermediate: {
          type: [String],
          required: true,
        },
        advanced: {
          type: [String],
          required: true,
        },
        expert: {
          type: [String],
          required: true,
        },
      },
      behavioralFocus: {
        type: Object,
        required: true,
        beginner: {
          type: String,
          required: true,
        },
        intermediate: {
          type: String,
          required: true,
        },
        advanced: {
          type: String,
          required: true,
        },
        expert: {
          type: String,
          required: true,
        },
      },
      technicalDepth: {
        type: Object,
        required: true,
        beginner: {
          type: String,
          required: true,
        },
        intermediate: {
          type: String,
          required: true,
        },
        advanced: {
          type: String,
          required: true,
        },
        expert: {
          type: String,
          required: true,
        },
      },
      followUpStrategy: {
        type: Object,
        required: true,
        15: {
          type: String,
          required: true,
        },
        30: {
          type: String,
          required: true,
        },
        45: {
          type: String,
          required: true,
        },
        60: {
          type: String,
          required: true,
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const InterviewTemplate = mongoose.model(
  "InterviewTemplate",
  interviewTemplateSchema
);
