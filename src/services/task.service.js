import { HTTP_STATUS } from "../constants/httpStatus.js";
import { fetchProjectById } from "./project.service.js";
import { fetchWorkspaceById } from "./workspace.service.js";
import { createTask, deleteTask, getTaskById, getTasksByProject, updateTask } from "../repositories/task.repository.js";
import ApiError from "../utils/ApiError.js";

export const createNewTask = async (
    workspaceId,
    projectId,
    userId,
    taskData
) => {
    // Validate workspace
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Validate project
    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    // Check if project belongs to workspace
    const isValidProject =
        project.workspace?.toString() === workspaceId;

    if (!isValidProject) {
        throw new ApiError(
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "Project does not belong to the workspace"
        );
    }

    // Check if creator is a workspace member
    const isMember = workspace.members?.some(
        (member) =>
            member.user?._id?.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not a member of the workspace"
        );
    }

    // Validate assignee if provided
    const assignedTo = taskData?.assignedTo;

    if (assignedTo) {
        const isValidAssignee = workspace.members?.some(
            (member) =>
                member.user?._id?.toString() === assignedTo
        );

        if (!isValidAssignee) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Assignee is not a member of the workspace"
            );
        }
    }

    // Prepare task data
    const newTaskData = {
        ...taskData,
        workspace: workspaceId,
        project: projectId,
        createdBy: userId,
    };

    // Create task
    const task = await createTask(newTaskData);

    return task;
};

export const updateExistingTask = async (
    taskId,
    workspaceId,
    projectId,
    userId,
    taskData
) => {
    // Validate workspace
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Validate project
    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    // Check if project belongs to workspace
    const isValidProject =
        project.workspace?.toString() === workspaceId;

    if (!isValidProject) {
        throw new ApiError(
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "Project does not belong to the workspace"
        );
    }

    // Check if creator is a workspace member
    const isMember = workspace.members?.some(
        (member) =>
            member.user?._id?.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not a member of the workspace"
        );
    }

    // Validate assignee if provided
    const assignedTo = taskData?.assignedTo;

    if (assignedTo) {
        const isValidAssignee = workspace.members?.some(
            (member) =>
                member.user?._id?.toString() === assignedTo
        );

        if (!isValidAssignee) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Assignee is not a member of the workspace"
            );
        }
    }

    return await updateTask(
        taskId,
        workspaceId,
        projectId,
        taskData
    )
};

export const fetchAllTasksByProject = async (workspaceId, projectId) => {
    // Validate workspace
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Validate project
    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    return getTasksByProject(workspaceId, projectId);
};

export const fetchTaskById = async (workspaceId, projectId, taskId) => {
    // Validate workspace
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Validate project
    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    return await getTaskById(workspaceId, projectId, taskId);
};

export const deleteExistingTask = async (
    workspaceId,
    projectId,
    taskId
) => {
    // Validate workspace
    const workspace = await fetchWorkspaceById(workspaceId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    // Validate project
    const project = await fetchProjectById(workspaceId, projectId, userId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    const deletedTask = await deleteTask(
        taskId,
        workspaceId,
        projectId
    );

    if (!deletedTask) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Task not found"
        );
    }

    return deletedTask;
};

