import { INVITATION_STATUS } from "../constants/invitationStatus.js";
import WorkspaceInvitation from "../models/invitation.model.js"

export const createInvitation = (data) => {
    return WorkspaceInvitation.create(data);
}

export const findPendingInvitation = (workspaceId, email) => {
    return WorkspaceInvitation.findOne({
        workspace: workspaceId,
        email,
        status: INVITATION_STATUS.PENDING
    });
}