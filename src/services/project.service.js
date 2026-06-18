import { createProject, findProjectById, findProjectsByWorkspaceId } from "../repositories/project.repository.js"

export const createNewProject = async (data, workspaceId, userId) => {
    const projectData = {
        ...data,
        workspace: workspaceId,
        createdBy: userId
    }

    return await createProject(projectData);
}

export const fetchAllProjectsOfWorkspace = async (workspaceId) => {
    return await findProjectsByWorkspaceId(workspaceId);
}

export const fetchProjectById = async (projectId) => {
    return await findProjectById(projectId);
}