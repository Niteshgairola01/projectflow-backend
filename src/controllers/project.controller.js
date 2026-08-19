import { HTTP_STATUS } from "../constants/httpStatus.js";
import { findProjectById } from "../repositories/project.repository.js";
import { findWorkspaceById } from "../repositories/workspace.repository.js";
import { createNewProject, deleteExistingProject, fetchAllProjectsOfWorkspace, fetchProjectById, updateExistingProject } from "../services/project.service.js";
import { fetchWorkspaceById } from "../services/workspace.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// create
export const createProject = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const workspaceId = req.params?.workspaceId;

        // check of workspace
        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace Id not found"
            );
        }

        const workspace = await fetchWorkspaceById(workspaceId);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        // check if the user is member of the workspace or not
        const isMember = workspace.members.some(member => member.user._id.toString() === userId);

        if (!isMember) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "User is not a member of the workspace"
            )
        }

        // create project and return response
        const project = await createNewProject(req.body, workspaceId, userId);

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    project,
                    "Project created successfully"
                )
            )

    }
);

// get all projects by workspace id
export const getProjectsByWorkspaceId = asyncHandler(
    async (req, res) => {
        const workspaceId = req.params?.workspaceId;

        // check of workspace
        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace Id not found"
            );
        }

        const workspace = await fetchWorkspaceById(workspaceId);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        // fetch projects and return response
        const projects = await fetchAllProjectsOfWorkspace(workspaceId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    projects,
                    "All projects for workspace fetched successfullly"
                )
            )
    }
);

// get project by id
export const getProjectById = asyncHandler(
    async (req, res) => {

        const workspaceId = req.params?.workspaceId;
        const projectId = req.params?.projectId;

        // check for workspace
        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace Id not found"
            )
        }

        const workspace = await fetchWorkspaceById(workspaceId);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        // fetch project
        const project = await fetchProjectById(projectId);

        // check if project is present or not
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

        // return response
        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    project,
                    "Project fetched successfully"
                )
            );


    }
);

// update project
export const updateProject = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId } = req.params;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace id not found"
            );
        }

        if (!projectId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Project id not found"
            );
        }

        const workspace = await findWorkspaceById(workspaceId);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            )
        }

        // check if the user is member of the workspace or not
        const isMember = workspace.members.some(member => member.user._id.toString() === userId);

        if (!isMember) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "User is not a member of the workspace"
            )
        }

        // check if the project is present or not
        const projectDetails = await fetchProjectById(projectId);
        if (!projectDetails) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Project not found"
            )
        }

        // Update project
        const project = await updateExistingProject(req.body, projectId, workspaceId, userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    project,
                    "Project updated successfully"
                )
            )


    }
);

export const deleteProject = asyncHandler(
    async (req, res) => {
        const { projectId, workspaceId } = req.params;

        if (!projectId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Project id not found"
            );
        }

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace id not found"
            );
        }

        const project = await deleteExistingProject(
            projectId,
            workspaceId
        );

        if (!project) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Project not found in this workspace"
            );
        }

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    null,
                    "Project deleted successfully"
                )
            );
    }
);