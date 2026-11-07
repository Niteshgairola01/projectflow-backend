import { HTTP_STATUS } from "../constants/httpStatus.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { addComment, editComment, findActiveCommentByIdAndTask, getCommentsByTask, softDeleteComment } from "../repositories/comment.repository.js";
import ApiError from "../utils/ApiError.js";
import { authorizeProjectManagement } from "../utils/authorization/authorizeProjectManagement.js";
import { fetchProjectById } from "./project.service.js";
import { fetchTaskById } from "./task.service.js";
import { fetchWorkspaceById } from "./workspace.service.js";

export const validate = async (
    workspaceId,
    projectId,
    taskId,
    userId,
    permission
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

    // Validate task
    const task = await fetchTaskById(workspaceId, projectId, taskId, userId);
    if (!task) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Task not found"
        );
    }

    authorizeProjectManagement(
        workspace,
        project,
        userId,
        permission
    );
}

export const addNewComment = async (
    workspaceId,
    projectId,
    taskId,
    commentData,
    userId,
) => {
    // Validate workspace, project and task 
    await validate(
        workspaceId,
        projectId,
        taskId,
        userId,
        PERMISSIONS.ADD_COMMENT
    );

    // validate parent comment
    if (commentData.parentComment) {
        const parentComment = await findActiveCommentByIdAndTask(
            commentData.parentComment,
            taskId
        );

        if (!parentComment) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Parent comment not found on this task"
            );
        }
    }

    // Add comment
    const newComment = {
        ...commentData,
        author: userId,
        taskId
    };

    return await addComment(newComment);
}

export const getAllCommentsByTask = async (
    workspaceId,
    projectId,
    taskId,
    userId
) => {
    await validate(
        workspaceId,
        projectId,
        taskId,
        userId,
        PERMISSIONS.VIEW_ALL_COMMENTS
    );

    return await getCommentsByTask(taskId);
}

export const updateComment = async (
    workspaceId,
    projectId,
    taskId,
    commentId,
    commentData,
    userId
) => {
    await validate(
        workspaceId,
        projectId,
        taskId,
        userId,
        PERMISSIONS.EDIT_COMMENT
    );

    // update comment
    const updatedComment = await editComment(commentId, taskId, userId, commentData);
    if (!updatedComment) {
        const comment = await findActiveCommentByIdAndTask(commentId, taskId);
        if (comment && comment.author?.toString() !== userId.toString()) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You can only edit your own comments"
            );
        }

        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Comment not found"
        );
    }

    return updatedComment;
}

export const deleteExistingComment = async (workspaceId, projectId, taskId, commentId, userId) => {
    await validate(
        workspaceId,
        projectId,
        taskId,
        userId,
        PERMISSIONS.DELETE_COMMENT
    );

    const deletedComment = await softDeleteComment(commentId, taskId, userId);

    if (!deletedComment) {
        const comment = await findActiveCommentByIdAndTask(commentId, taskId);

        if (comment && comment.author?.toString() !== userId.toString()) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You can only delete your own comments"
            );
        }

        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Comment not found"
        );
    }
};