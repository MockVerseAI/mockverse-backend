import mongoose, { Schema } from "mongoose";

const deepgramKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    api_key_id: {
      type: String,
      required: true,
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

export const DeepgramKey = mongoose.model("DeepgramKey", deepgramKeySchema);
