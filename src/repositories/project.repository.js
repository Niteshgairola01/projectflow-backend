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

export const updateProject = (projectId, workspaceId, projectData,) => {
    return Project.findByIdAndUpdate(
        {
            _id: projectId,
            workspace: workspaceId
        },
        projectData,
        {
            new: true,
            runValidators: true
        }
    );
}

export const deleteProject = (projectId, workspaceId) => {
    return Project.findOneAndDelete(
        {
            _id: projectId,
            workspace: workspaceId
        }
    )
}