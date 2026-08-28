import { HTTP_STATUS } from "../constants/httpStatus.js";
import { fetchProjectById } from "./project.service.js";
import { fetchWorkspaceById } from "./workspace.service.js";
import { createTask, deleteTask, getTaskById, getTasksByProject, updateTask } from "../repositories/task.repository.js";
import ApiError from "../utils/ApiError.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { authorizeProjectManagement } from "../utils/authorization/authorizeProjectManagement.js";
import { findProjectById } from "../repositories/project.repository.js";

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

    // Fetch project
    const project = await findProjectById(workspaceId, projectId);

    if (!project) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Project not found"
        );
    }

    // RBAC
    authorizeProjectManagement(
        workspace,
        project,
        userId,
        PERMISSIONS.CREATE_TASK
    );

    // Validate assignee
    const assignedTo = taskData?.assignedTo;

    if (assignedTo) {
        const isProjectMember = project.members?.some(
            (member) =>
                member.user?._id?.toString() === assignedTo?.toString() ||
                member.user?.toString() === assignedTo?.toString()
        );

        if (!isProjectMember) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Assignee must be a member of the project"
            );
        }
    }

    const newTaskData = {
        ...taskData,
        workspace: workspaceId,
        project: projectId,
        createdBy: userId,
    };

    return await createTask(newTaskData);
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

    // RBAC
    authorizeProjectManagement(
        workspace,
        project,
        userId,
        PERMISSIONS.UPDATE_TASK
    );

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

export const fetchAllTasksByProject = async (workspaceId, projectId, userId) => {
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

    authorizeProjectManagement(
        workspace,
        project,
        userId,
        PERMISSIONS.VIEW_ALL_PROJECT_TASKS,
    );

    return getTasksByProject(workspaceId, projectId);
};

export const fetchTaskById = async (workspaceId, projectId, taskId, userId) => {
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

    authorizeProjectManagement(
        workspace,
        project,
        userId,
        PERMISSIONS.VIEW_TASK
    )

    return await getTaskById(workspaceId, projectId, taskId);
};

export const deleteExistingTask = async (
    workspaceId,
    projectId,
    taskId,
    userId
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

    // Fetch task before deletion
    const task = await fetchTaskById(workspaceId, projectId, taskId, userId);

    if (!task) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Task not found"
        );
    }

    /*
     * DELETE_ANY_TASK.
     *
     * Allowed:
     * - Workspace OWNER
     * - Workspace ADMIN
     * - Project PROJECT_ADMIN
     */
    try {
        authorizeProjectManagement(
            workspace,
            project,
            userId,
            PERMISSIONS.DELETE_ANY_TASK
        );
    } catch (error) {
        /*
         * User cannot delete any task.
         * Now check whether they can delete their own task.
         */
        authorizeProjectManagement(
            workspace,
            project,
            userId,
            PERMISSIONS.DELETE_OWN_TASK
        );

        const isCreator =
            task.createdBy?._id?.toString() === userId?.toString() ||
            task.createdBy?.toString() === userId?.toString();

        if (!isCreator) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You can only delete tasks created by you"
            );
        }
    }

    const deletedTask = await deleteTask(
        taskId,
        workspaceId,
        projectId
    );

    return deletedTask;
};

