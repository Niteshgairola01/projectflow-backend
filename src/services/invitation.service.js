import crypto from "crypto"
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import { findByEmail, findById } from "../repositories/auth.repository.js";
import { createInvitation, findInvitationByToken, findPendingInvitation, findPendingInvitationsByEmail, markInvitationAsAccepted, sendWorkspaceInvitationEmail } from "../repositories/invitation.repository.js";
import { findWorkspaceById } from "../repositories/workspace.repository.js"
import ApiError from "../utils/ApiError.js";
import { INVITATION_STATUS } from "../constants/invitationStatus.js";
import { getUser } from "./auth.service.js";
import { addWorkspaceMember } from "../repositories/member.repository.js";

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

    if (role !== WORKSPACE_ROLES.OWNER && role !== WORKSPACE_ROLES.ADMIN) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not authorized to send invitations"
        );
    }

    // get user by email
    const userBeingInvited = await findByEmail(email);

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

    // get inviter's details
    const inviter = await getUser(invitedBy);

    await sendWorkspaceInvitationEmail({
        to: email,
        workspaceName: workspace.name,
        inviterName: inviter.name,
        invitationToken: token,
    });

    return invitation;
};

export const fetchInvitationByToken = async (token, workspaceId) => {
    const invitation = await findInvitationByToken(token, workspaceId);

    if (!invitation) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Invitation not found"
        );
    }

    // check if invitation is pending or not
    if (invitation.status !== INVITATION_STATUS.PENDING) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Invitation is no longer available"
        );
    }

    // check if invitaion has been expired or not
    if (new Date() > new Date(invitation.expiresAt)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Invitation has been expired"
        );
    }

    return invitation;
}

export const fetchPendingInvitations = async (userId) => {
    const user = await getUser(userId);

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "User not found"
        );
    }

    const invitations = await findPendingInvitationsByEmail(user.email);
    return invitations;
};

export const acceptWorkspaceInvitation = async (workspaceId, token, userId) => {
    const invitation = await fetchInvitationByToken(token, workspaceId);

    if (!invitation) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Invitation not found"
        )
    }

    // check if invitation is pending or not
    if (invitation.status !== INVITATION_STATUS.PENDING) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Invitation is not longer pending"
        );
    }

    // check if invitation in expired
    if (new Date() > new Date(invitation.expiresAt)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Invitaiton has been expired"
        );
    }

    // fetch loggedin user
    const user = await findById(userId);
    if (!user) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "User not found"
        );
    }

    // check if user's email same as invited email
    if (user.email?.toLowerCase() !== invitation.email?.toLowerCase()) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "This invitation was sent to a different email address"
        );
    }

    // check if workspace exists or not
    const workspace = await findWorkspaceById(workspaceId);
    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // check if invited user is already a member of the workspace
    const isAlreadyMember = workspace.members.some(member => member.user._id?.toString() === userId?.toString());
    if (isAlreadyMember) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "User is already a member of this workspace"
        );
    }

    // add user as workspace member
    await addWorkspaceMember(workspaceId, userId);

    // mark invitation as 'accepted'
    await markInvitationAsAccepted(invitation._id);

    return {
        workspaceId,
        invitationId: invitation._id
    }
}