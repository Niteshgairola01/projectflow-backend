import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import Workspace from "../models/workspace.model.js";

export const createWorkspace = (workspaceData) => {
    return Workspace.create(workspaceData);
}

export const findWorkspacesByUserId = (userId) => {
    return Workspace.find({ "members.user": userId });
}

export const findWorkspaceById = (id) => {
    return Workspace.findById(id)
        .populate("members.user", "name email")
}

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