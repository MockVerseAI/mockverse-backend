import mongoose, { Schema } from "mongoose";
// Interview schema definition
const interviewSchema = new Schema({
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
}, {
    timestamps: true,
});
// Create and export the Interview model
export const Interview = mongoose.model("Interview", interviewSchema);
//# sourceMappingURL=interview.model.js.map