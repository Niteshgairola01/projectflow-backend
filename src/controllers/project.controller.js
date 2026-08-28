import { HTTP_STATUS } from "../constants/httpStatus.js";
import { createNewProject, deleteExistingProject, fetchAllProjectsOfWorkspace, fetchProjectById, updateExistingProject } from "../services/project.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// create
export const createProject = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const workspaceId = req.params?.workspaceId;

    if (!workspaceId) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace Id not found"
        );
    }

    const project = await createNewProject(
        req.body,
        workspaceId,
        userId
    );

    return res
        .status(HTTP_STATUS.CREATED)
        .json(
            new ApiResponse(
                HTTP_STATUS.CREATED,
                project,
                "Project created successfully"
            )
        );
});

// get all projects by workspace id
export const getProjectsByWorkspaceId = asyncHandler(
    async (req, res) => {
        const workspaceId = req.params?.workspaceId;
        const userId = req.user?.userId;

        // check of workspace
        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace Id not found"
            );
        }

        // fetch projects and return response
        const projects = await fetchAllProjectsOfWorkspace(workspaceId, userId);

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
        const userId = req.user?.userId;

        // check for workspace
        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace Id not found"
            )
        }

        if (!projectId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Project Id not found"
            )
        }

        // fetch project
        const project = await fetchProjectById(workspaceId, projectId, userId);

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
                HTTP_STATUS.BAD_REQUEST,
                "Workspace id not found"
            );
        }

        if (!projectId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Project id not found"
            );
        }

        // console.log("test", userId);


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
        const userId = req.user?.userId;

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
            workspaceId,
            userId
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