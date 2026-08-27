import { HTTP_STATUS } from "../constants/httpStatus.js"
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import { findMembersByWorkspace, removeMemberFromWorkspaceProjects, removeWorkspaceMember, updateWorkspaceMemberRole } from "../repositories/member.repository.js";
import { findWorkspace } from "../repositories/workspace.repository.js";
import ApiError from "../utils/ApiError.js"

export const fetchWorkspaceMembers = async (workspaceId, userId) => {
    const workspace = await findMembersByWorkspace(workspaceId, userId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const isMember = workspace.members.some(member => member.user._id?.toString() === userId);

    if (!isMember) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not a member of workspace"
        )
    }

    return workspace.members;
}

export const updateWorkspaceMember = async (
    workspaceId,
    targetUserId,
    newRole,
    requestedBy
) => {
    const workspace = await findWorkspace(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Requester must belong to workspace
    const requester = workspace.members.find((member) => member.user?.toString() === requestedBy?.toString());

    if (!requester) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not a member of this workspace"
        );
    }

    // Only OWNER / ADMIN can manage member roles
    if (
        requester.role !== WORKSPACE_ROLES.OWNER &&
        requester.role !== WORKSPACE_ROLES.ADMIN
    ) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not authorized to update member roles"
        );
    }

    // Target must already belong to workspace
    const targetMember = workspace.members.find((member) => member.user?.toString() === targetUserId?.toString());

    if (!targetMember) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Member not found in this workspace"
        );
    }

    // OWNER role should not be managed from normal member API
    if (targetMember.role === WORKSPACE_ROLES.OWNER) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "Workspace owner role cannot be changed"
        );
    }

    // Prevent assigning OWNER through this API
    if (newRole === WORKSPACE_ROLES.OWNER) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "OWNER role cannot be assigned through this endpoint"
        );
    }

    // only OWNER can promote/demote ADMINs
    if (
        requester.role === WORKSPACE_ROLES.ADMIN &&
        (
            targetMember.role === WORKSPACE_ROLES.ADMIN ||
            newRole === WORKSPACE_ROLES.ADMIN
        )
    ) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "Only the workspace owner can manage admin roles"
        );
    }

    // No-op update
    if (targetMember.role === newRole) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Member already has role ${newRole}`
        );
    }

    const updatedWorkspace = await updateWorkspaceMemberRole(workspaceId, targetUserId, newRole);

    const updatedMember = updatedWorkspace.members.find((member) => member.user?._id?.toString() === targetUserId?.toString());

    return updatedMember;
};

export const deleteWorkspaceMember = async (
    workspaceId,
    targetUserId,
    requestedBy
) => {
    const workspace =
        await findWorkspace(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Find requester
    const requester = workspace.members.find((member) => member.user?.toString() === requestedBy?.toString());

    if (!requester) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not a member of this workspace"
        );
    }

    // Only OWNER / ADMIN can remove members
    if (
        requester.role !== WORKSPACE_ROLES.OWNER &&
        requester.role !== WORKSPACE_ROLES.ADMIN
    ) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not authorized to remove workspace members"
        );
    }

    // Find target member
    const targetMember = workspace.members.find((member) => member.user?.toString() === targetUserId?.toString());

    if (!targetMember) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Member not found in this workspace"
        );
    }

    // Workspace owner cannot be removed
    if (targetMember.role === WORKSPACE_ROLES.OWNER) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "Workspace owner cannot be removed"
        );
    }

    // ADMIN cannot remove another ADMIN
    if (
        requester.role === WORKSPACE_ROLES.ADMIN &&
        targetMember.role === WORKSPACE_ROLES.ADMIN
    ) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "Only the workspace owner can remove an admin"
        );
    }

    // Prevent ADMIN from removing OWNER explicitly as well,

    // Remove from workspace
    await removeWorkspaceMember(
        workspaceId,
        targetUserId
    );

    // Remove from all projects inside workspace
    await removeMemberFromWorkspaceProjects(
        workspaceId,
        targetUserId
    );

    return null;
};