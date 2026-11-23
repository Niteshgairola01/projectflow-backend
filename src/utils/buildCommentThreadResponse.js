// Retain only deleted ancestors needed to connect surviving comments.
// Deleted content and author must never be included in the API response.
export const buildCommentThreadResponse = (comments) => {
    const byId = new Map(comments.map((comment) => [String(comment._id), comment]));
    const retained = new Set();

    for (const comment of comments) {
        if (comment.isDeleted) continue;
        let current = comment;
        while (current && !retained.has(String(current._id))) {
            retained.add(String(current._id));
            current = current.parentComment
                ? byId.get(String(current.parentComment))
                : undefined;
        }
    }

    return comments.filter((comment) => retained.has(String(comment._id))).map((comment) => {
        if (!comment.isDeleted) return comment;
        return {
            _id: comment._id,
            taskId: comment.taskId,
            parentComment: comment.parentComment,
            isDeleted: true,
            isEdited: false,
            deletedAt: comment.deletedAt,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    });
};
