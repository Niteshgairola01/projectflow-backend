import Comment from "../models/comment.model.js";

export const softDeleteComment = (commentId, taskId, userId) => {
    return Comment.findOneAndUpdate(
        { _id: commentId, taskId, author: userId, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true, runValidators: true }
    );
};

export const findActiveCommentByIdAndTask = (commentId, taskId) => {
    return Comment.findOne({
        _id: commentId,
        taskId,
        isDeleted: false,
    });
};

export const addComment = (comment) => {
    return Comment.create(comment)
};

export const getCommentsByTask = (taskId) => {
    return Comment.find({
        taskId,
        isDeleted: false,
    });
};

export const getCommentById = (commentId) => {
    return Comment.findOne({ _id: commentId, isDeleted: false });
};

export const editComment = (commentId, taskId, userId, comment) => {
    return Comment.findOneAndUpdate(
        { _id: commentId, taskId, author: userId, isDeleted: false },
        { $set: { content: comment.content, isEdited: true } },
        { new: true, runValidators: true }
    );
};
