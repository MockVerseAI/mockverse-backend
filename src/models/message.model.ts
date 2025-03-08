import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface for Message document
 */
export interface MessageDocument extends Document {
  content: string;
  role: string;
  interviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for Message model
 */
const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
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

// Create index for improved query performance
messageSchema.index({ interviewId: 1 });

/**
 * Message model
 */
export const Message: Model<MessageDocument> = mongoose.model<MessageDocument>(
  "Message",
  messageSchema
);
