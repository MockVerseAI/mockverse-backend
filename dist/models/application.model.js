import mongoose, { Schema } from "mongoose";
// Application schema definition
const applicationSchema = new Schema({
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
}, {
    timestamps: true,
});
// Create and export the Application model
export const Application = mongoose.model("Application", applicationSchema);
//# sourceMappingURL=application.model.js.map