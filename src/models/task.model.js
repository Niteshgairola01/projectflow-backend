import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
            default: "TODO",
        },

        priority: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW"],
            default: "MEDIUM",
        },

        dueDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

TaskSchema.index({ workspace: 1, project: 1 });

export default mongoose.model("Task", TaskSchema);