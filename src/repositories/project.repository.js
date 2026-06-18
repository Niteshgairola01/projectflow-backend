import Project from "../models/project.model.js";

export const createProject = (projectData) => {
    return Project.create(projectData);
}

export const findProjectsByWorkspaceId = (workspaceId) => {
    return Project.find({
        workspace: workspaceId
    }).sort({
        createdAt: -1
    });
}

export const findProjectById = (projectId) => {
    return Project.findById(projectId);
}