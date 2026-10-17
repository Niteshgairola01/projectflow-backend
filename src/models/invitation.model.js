import mongoose from "mongoose";
import { INVITATION_STATUS } from "../constants/invitationStatus.js";

const InvitationSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true,
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },

    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    expiresAt: {
        type: Date,
        required: true,
    },

    status: {
        type: String,
        enum: [
            INVITATION_STATUS.PENDING,
            INVITATION_STATUS.ACCEPTED,
            INVITATION_STATUS.EXPIRED,
            INVITATION_STATUS.CANCELLED,
        ],
        default: INVITATION_STATUS.PENDING,
    },
}, {
    timestamps: true,
});

// Used when checking for duplicate pending invitations
InvitationSchema.index({
    workspace: 1,
    email: 1,
    status: 1,
});

export default mongoose.model("WorkspaceInvitation", InvitationSchema);