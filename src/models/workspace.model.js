import mongoose from "mongoose";
import { WorkspaceMemberSchema } from "./schemas/workspaceMember.schema.js";

export const WorkspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [WorkspaceMemberSchema]
}, {
    timestamps: true
});

export default mongoose.model("Workspace", WorkspaceSchema)