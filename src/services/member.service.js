import { HTTP_STATUS } from "../constants/httpStatus.js"
import { PERMISSIONS } from "../constants/permissions.js";
import { PROJECT_ROLES } from "../constants/projectRoles.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import { addMemberToProject, findMembersByProject, findMembersByWorkspace, findProjectForMemberManagement, removeMemberFromProject, removeMemberFromWorkspaceProjects, removeWorkspaceMember, updateProjectMemberRole, updateWorkspaceMemberRole } from "../repositories/member.repository.js";
import { findWorkspace, findWorkspaceById } from "../repositories/workspace.repository.js";
import ApiError from "../utils/ApiError.js"
import { authorizeProjectManagement } from "../utils/authorization/authorizeProjectManagement.js";
import { authorizeWorkspacePermission } from "../utils/authorization/authorizeWorkspacePermission.js";

export const fetchWorkspaceMembers = async (workspaceId, userId) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    authorizeWorkspacePermission(
        workspace,
        userId,
        PERMISSIONS.VIEW_WORKSPACE_MEMBERS
    );

    const workspaceWithMembers = await findMembersByWorkspace(workspaceId, userId)
    return workspaceWithMembers.members;
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

    // Autorize requester
    const requester = authorizeWorkspacePermission(
        workspace,
        requestedBy,
        PERMISSIONS.MANAGE_WORKSPACE_MEMBERS
    );

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

    const requester = authorizeWorkspacePermission(
        workspace,
        requestedBy,
        PERMISSIONS.MANAGE_WORKSPACE_MEMBERS
    );

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



// Project members

export const fetchProjectMembers = async (
    workspaceId,
    projectId,
    requestedBy
) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const project = await findMembersByProject(
        workspaceId,
        projectId
    );

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    authorizeProjectManagement(
        workspace,
        project,
        requestedBy,
        PERMISSIONS.VIEW_PROJECT_MEMBERS
    )

    // User must belong to workspace
    const workspaceMember = workspace.members.some((member) => member.user._id?.toString() === requestedBy?.toString());

    if (!workspaceMember) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not a member of this workspace"
        );
    }

    return project.members;
};


export const addNewProjectMember = async (
    workspaceId,
    projectId,
    userId,
    role,
    requestedBy
) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const project = await findProjectForMemberManagement(
        workspaceId,
        projectId
    );

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    // Check requester permissions
    authorizeProjectManagement(
        workspace,
        project,
        requestedBy,
        PERMISSIONS.MANAGE_PROJECT_MEMBERS
    );

    // Target user MUST belong to workspace
    const workspaceMember = workspace.members.find((member) => member.user._id?.toString() === userId?.toString());

    if (!workspaceMember) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "User must be a workspace member before being added to the project"
        );
    }

    // Prevent duplicate project membership
    const alreadyMember = project.members.some((member) => member.user?.toString() === userId?.toString());

    if (alreadyMember) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "User is already a member of this project"
        );
    }

    const updatedProject = await addMemberToProject(
        workspaceId,
        projectId,
        userId,
        role
    );

    const addedMember = updatedProject.members.find((member) => member.user?._id?.toString() === userId?.toString());

    return addedMember;
};

export const updateProjectMember = async (
    workspaceId,
    projectId,
    targetUserId,
    role,
    requestedBy
) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const project = await findProjectForMemberManagement(
        workspaceId,
        projectId
    );

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    authorizeProjectManagement(
        workspace,
        project,
        requestedBy,
        PERMISSIONS.MANAGE_PROJECT_MEMBERS
    );

    const targetMember = project.members.find(
        (member) =>
            member.user?.toString() === targetUserId?.toString()
    );

    if (!targetMember) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project member not found"
        );
    }

    if (targetMember.role === role) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Member already has role ${role}`
        );
    }

    const updatedProject = await updateProjectMemberRole(
        workspaceId,
        projectId,
        targetUserId,
        role
    );

    const updatedMember = updatedProject.members.find(
        (member) =>
            member.user?._id?.toString() ===
            targetUserId?.toString()
    );

    return updatedMember;
};


export const deleteProjectMember = async (
    workspaceId,
    projectId,
    targetUserId,
    requestedBy
) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const project = await findProjectForMemberManagement(
        workspaceId,
        projectId
    );

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    authorizeProjectManagement(
        workspace,
        project,
        requestedBy,
        PERMISSIONS.MANAGE_PROJECT_MEMBERS
    );

    const targetMember = project.members.find(
        (member) =>
            member.user?.toString() === targetUserId?.toString()
    );

    if (!targetMember) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project member not found"
        );
    }

    await removeMemberFromProject(
        workspaceId,
        projectId,
        targetUserId
    );

    return null;
};