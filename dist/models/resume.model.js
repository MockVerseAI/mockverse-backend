import mongoose, { Schema } from "mongoose";
// Resume schema definition
const resumeSchema = new Schema({
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
    fileUrl: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Create and export the Resume model
export const Resume = mongoose.model("Resume", resumeSchema);
//# sourceMappingURL=resume.model.js.map