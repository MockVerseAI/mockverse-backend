import mongoose, { Schema } from "mongoose";

const interviewSchema = new Schema(
  {
    duration: {
      type: Number,
      enum: [15, 30, 45, 60],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: true,
    },
    interviewWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewWorkspace",
      required: true,
    },
    interviewTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewTemplate",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isAgentMode: {
      type: Boolean,
      default: false,
    },
    isVideoEnabled: {
      type: Boolean,
      default: false,
    },
    assistantId: {
      type: String,
      default: null,
    },
    recordings: {
      voice: {
        combined: {
          type: String,
          default: null,
        },
        assistant: {
          type: String,
          default: null,
        },
        user: {
          type: String,
          default: null,
        },
      },
      video: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model("Interview", interviewSchema);
