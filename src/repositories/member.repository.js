import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import { findWorkspaceById } from "./workspace.repository.js";
import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";


export const addWorkspaceMember = (workspaceId, userId) => {
    return Workspace.findByIdAndUpdate(
        workspaceId,
        {
            $push: {
                members: {
                    user: userId,
                    role: WORKSPACE_ROLES.MEMBER
                }
            }
        },
        {
            new: true
        }
    )
}

export const findMembersByWorkspace = (workspaceId) => {
    return Workspace.findById(workspaceId)
        .populate("members.user", "name email avatar")
        .select("members")
        .lean();
}

export const updateWorkspaceMemberRole = (workspaceId, userId, role) => {
    return Workspace.findOneAndUpdate(
        {
            _id: workspaceId,
            "members.user": userId
        },
        {
            $set: {
                "members.$.role": role
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
}

export const removeWorkspaceMember = (workspaceId, userId) => {
    return Workspace.findByIdAndUpdate(
        workspaceId,
        {
            $pull: {
                members: {
                    user: userId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

// Remove user from every project belonging to the workspace.
export const removeMemberFromWorkspaceProjects = (workspaceId, userId) => {
    return Project.updateMany(
        {
            workspace: workspaceId,
        },
        {
            $pull: {
                members: {
                    user: userId,
                },
            },
        }
    );
};




// project members

export const findMembersByProject = (workspaceId, projectId) => {
    return Project.findOne(
        {
            _id: projectId,
            workspace: workspaceId
        },
    )
        .populate("members.user", "name email avatar")
        .select("members")
        .lean()
}

export const findProjectForMemberManagement = (workspaceId, projectId) => {
    return Project.findOne({
        _id: projectId,
        workspace: workspaceId,
    });
};

export const addMemberToProject = (workspaceId, projectId, userId, role) => {
    return Project.findOneAndUpdate(
        {
            _id: projectId,
            workspace: workspaceId,
        },
        {
            $push: {
                members: {
                    user: userId,
                    role,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("members.user", "name email avatar");
};

export const updateProjectMemberRole = (workspaceId, projectId, userId, role) => {
    return Project.findOneAndUpdate(
        {
            _id: projectId,
            workspace: workspaceId,
            "members.user": userId,
        },
        {
            $set: {
                "members.$.role": role,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("members.user", "name email avatar");
};

export const removeMemberFromProject = (workspaceId, projectId, userId) => {
    return Project.findOneAndUpdate(
        {
            _id: projectId,
            workspace: workspaceId,
        },
        {
            $pull: {
                members: {
                    user: userId,
                },
            },
        },
        {
            new: true,
        }
    );
};