import { HTTP_STATUS } from "../constants/httpStatus.js";
import { createNewTask, deleteExistingTask, fetchAllTasksByProject, fetchTaskById, updateExistingTask } from "../services/task.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTask = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId } = req.params;

        const task = await createNewTask(
            workspaceId,
            projectId,
            userId,
            req.body
        );

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    task,
                    "Task created successfully"
                )
            );
    }
);

export const updateTask = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId, taskId } = req.params;

        const task = await updateExistingTask(
            taskId,
            workspaceId,
            projectId,
            userId,
            req.body
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    task,
                    "Task updated successfully"
                )
            );


    }
);

export const getTasksByProject = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId } = req.params;

        // fetch tasks and return response
        const tasks = await fetchAllTasksByProject(workspaceId, projectId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    tasks,
                    "All tasks for project fetched successfullly"
                )
            );
    }
);

export const getTaskById = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId, taskId } = req.params;

        // fetch task
        const task = await fetchTaskById(workspaceId, projectId, taskId);


        if (!task) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Task not found"
            );
        }

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    task,
                    "Task fetched successfully"
                )
            );
    }
)

export const deleteTask = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId, taskId } = req.params;

        await deleteExistingTask(workspaceId, projectId, taskId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    null,
                    "Task deleted successfully"
                )
            );
    }
);