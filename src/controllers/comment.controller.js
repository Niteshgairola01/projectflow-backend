import { HTTP_STATUS } from "../constants/httpStatus.js";
import { addNewComment, deleteExistingComment, getAllCommentsByTask, updateComment } from "../services/comment.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const addComment = asyncHandler(
    async (req, res,) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId, taskId } = req.params;

        const comment = await addNewComment(
            workspaceId,
            projectId,
            taskId,
            req.body,
            userId
        );

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    comment,
                    "Comment added successfully"
                )
            );
    }
)

export const getCommentsByTask = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId, taskId } = req.params;

        const comments = await getAllCommentsByTask(
            workspaceId,
            projectId,
            taskId,
            userId
        );

        if (!comments) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Comments not found for task"
            );
        }

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    comments,
                    "Comments fethced successfully"
                )
            );
    }
);

export const editComment = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;
        const { workspaceId, projectId, taskId, commentId } = req.params;

        const body = {
            ...req.body,
            isEdited: true
        }

        const comment = await updateComment(
            workspaceId,
            projectId,
            taskId,
            commentId,
            body,
            userId
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    comment,
                    "Comment updated successfully"
                )
            );
    }
);

export const deleteComment = asyncHandler(
    async (req, res) => {
        const userId = req.user.userId;
        const { workspaceId, projectId, taskId, commentId } = req.params;

        await deleteExistingComment(
            workspaceId,
            projectId,
            taskId,
            commentId,
            userId
        );

        return res.status(HTTP_STATUS.NO_CONTENT).send();
    }
);

