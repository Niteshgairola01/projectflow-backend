import { HTTP_STATUS } from "../constants/httpStatus.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { PROJECT_ROLES } from "../constants/projectRoles.js";
import { createProject, deleteProject, findProjectById, findProjectsByWorkspaceId, updateProject } from "../repositories/project.repository.js"
import { findWorkspaceById } from "../repositories/workspace.repository.js";
import ApiError from "../utils/ApiError.js";
import { authorizeWorkspacePermission } from "../utils/authorization/authorizeWorkspacePermission.js";
import { fetchWorkspaceById } from "./workspace.service.js";

export const createNewProject = async (data, workspaceId, userId) => {
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    authorizeWorkspacePermission(
        workspace,
        userId,
        PERMISSIONS.CREATE_PROJECT
    );

    const projectData = {
        ...data,
        workspace: workspaceId,
        createdBy: userId,
        members: [
            {
                user: userId,
                role: PROJECT_ROLES.PROJECT_ADMIN,
            },
        ],
    };

    return await createProject(projectData);
};

export const fetchAllProjectsOfWorkspace = async (workspaceId, userId) => {
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    authorizeWorkspacePermission(
        workspace,
        userId,
        PERMISSIONS.VIEW_WORKSPACE_PROJECTS
    );

    return await findProjectsByWorkspaceId(workspaceId);
}

export const fetchProjectById = async (workspaceId, projectId, userId) => {
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    authorizeWorkspacePermission(
        workspace,
        userId,
        PERMISSIONS.VIEW_PROJECT
    );

    const project = await findProjectById(workspaceId, projectId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }


    // check if the project is present in the workspace or not
    if (project.workspace.toString() !== workspaceId) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found in this workspace"
        );
    }

    return project;
}

export const updateExistingProject = async (data, projectId, workspaceId, userId) => {
    const workspace = await findWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    authorizeWorkspacePermission(
        workspace,
        userId,
        PERMISSIONS.UPDATE_PROJECT
    );

    const projectData = {
        ...data,
        updatedBy: userId
    }

    return await updateProject(projectId, workspaceId, projectData);
}

export const deleteExistingProject = async (projectId, workspaceId, userId) => {
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
        PERMISSIONS.DELETE_PROJECT
    );

    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }


    return await deleteProject(projectId, workspaceId);
}