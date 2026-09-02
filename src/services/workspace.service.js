import { WORKSPACE_ROLES } from "../constants/workspaceRoles.js";
import {
    createWorkspace,
    findWorkspaceById,
    findWorkspacesWithProjectCount,
    findWorkspaceWithProjectCount
} from "../repositories/workspace.repository.js";

export const createNewWorkspace = async (data, userId) => {
    const { name, color } = data;

    const workspaceData = {
        name,
        owner: userId,
        members: [
            {
                user: userId,
                role: WORKSPACE_ROLES.OWNER
            }
        ],
        color
    }

    return await createWorkspace(workspaceData);
}

export const fetchAllWorkspacesofUser = async (userId) => {
    return await findWorkspacesWithProjectCount(userId);
}

export const fetchWorkspaceById = async (id) => {
    return await findWorkspaceById(id);
}

export const fetchWorkspaceByIdWithProjectCount = async (id, userId) => {
    return await findWorkspaceWithProjectCount(id, userId);
}
