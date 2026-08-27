import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";


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