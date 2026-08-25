import crypto from "crypto"
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import { findByEmail } from "../repositories/auth.repository.js";
import { createInvitation, findPendingInvitation } from "../repositories/invitation.repository.js";
import { findWorkspaceById } from "../repositories/workspace.repository.js"
import ApiError from "../utils/ApiError.js";
import { INVITATION_STATUS } from "../constants/invitationStatus.js";

export const createNewInvitation = async (workspaceId, email, invitedBy) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // check for member
    const member = workspace.members.find(member => member.user._id?.toString() === invitedBy?.toString());

    if (!member) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not a member of workspace"
        );
    }

    // check invitor's role
    const role = member?.role;
    // console.log("role", role, WORKSPACE_ROLES.OWNER);

    if (role !== WORKSPACE_ROLES.OWNER && role !== WORKSPACE_ROLES.ADMIN) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not authorized to send invitations"
        );
    }

    // get user by email
    const userBeingInvited = await findByEmail(email);
    console.log("userBeingInvited", userBeingInvited);


    // check if user is already a member or not
    const isAlreadyAMember = workspace.members.some(member => member.user._id?.toString() === userBeingInvited?._id?.toString());
    if (isAlreadyAMember) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "User is already a member"
        );
    }

    // find pending invitations for the user
    const existingInvitation = await findPendingInvitation(workspaceId, email);
    if (existingInvitation) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "A pending invitation already exists for this email"
        );
    }

    // generate secure invitation token
    const token = crypto.randomBytes(32).toString("hex");
    console.log("token", token);

    // add expiration of 7 days
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // create invitation
    const data = {
        workspace: workspaceId,
        email,
        invitedBy,
        token,
        expiresAt,
        status: INVITATION_STATUS.PENDING
    };

    const invitation = await createInvitation(data);

    return invitation;
}