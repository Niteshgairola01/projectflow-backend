import mongoose from "mongoose";

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
            "VIEWER"
        ],
        default: "MEMBER",
        required: true
    }
}, {
    _id: false
});