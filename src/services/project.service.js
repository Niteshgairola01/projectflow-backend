import { PROJECT_ROLES } from "../constants/projectRoles.js";
import { createProject, deleteProject, findProjectById, findProjectsByWorkspaceId, updateProject } from "../repositories/project.repository.js"

export const createNewProject = async (data, workspaceId, userId) => {
    const projectData = {
        ...data,
        workspace: workspaceId,
        createdBy: userId,
        members: [
            {
                user: userId,
                role: PROJECT_ROLES.PROJECT_ADMIN
            }
        ]
    };

    return await createProject(projectData);
}

export const fetchAllProjectsOfWorkspace = async (workspaceId) => {
    return await findProjectsByWorkspaceId(workspaceId);
}

export const fetchProjectById = async (projectId) => {
    return await findProjectById(projectId);
}

export const updateExistingProject = async (data, projectId, workspaceId, userId) => {
    const projectData = {
        ...data,
        updatedBy: userId
    }

    return await updateProject(projectId, workspaceId, projectData);
}

export const deleteExistingProject = async (projectId, workspaceId) => {
    return await deleteProject(projectId, workspaceId);
}