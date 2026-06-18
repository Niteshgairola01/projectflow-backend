import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["ACTIVE", "ARCHIVED"],
            default: "ACTIVE",
        },

        color: {
            type: String,
            default: "#6C63FF",
        },

        startDate: {
            type: Date,
        },

        endDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Project", ProjectSchema);