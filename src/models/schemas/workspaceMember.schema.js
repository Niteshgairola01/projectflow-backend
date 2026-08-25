import mongoose from "mongoose";
import { WORKSPACE_ROLES } from "../../constants/workspaceRoles.js";

export const WorkspaceMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    role: {
        type: String,
        enum: [
            "OWNER",
            "ADMIN",
            "MEMBER",
        ],
        default: WORKSPACE_ROLES.OWNER,
        required: true
    }
}, {
    _id: false
});