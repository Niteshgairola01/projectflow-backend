import mongoose from "mongoose";
import { PROJECT_ROLES } from "../../constants/projectRoles.js";

export const ProjectMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    role: {
        type: String,
        enum: [
            PROJECT_ROLES.PROJECT_ADMIN,
            PROJECT_ROLES.MEMBER,
        ],

        default: PROJECT_ROLES.MEMBER,
        required: true,
    },
}, {
    _id: false,
});