import mongoose, { Schema, Model } from "mongoose";
import { ApplicationDocument } from "../types/index.js";

// Application schema definition
const applicationSchema = new Schema<ApplicationDocument>(
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
    company: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Application model
export const Application: Model<ApplicationDocument> =
  mongoose.model<ApplicationDocument>("Application", applicationSchema);
