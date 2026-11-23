import { Router } from "express";
import { addComment, deleteComment, editComment, getCommentsByTask } from "../../controllers/comment.controller.js";
import { authenticateUser } from "../../middlewares/auth.js";
import { addCommentSchema, deleteCommentParamsSchema, editCommentSchema } from "../../validations/comment.validation.js";
import { validate } from "../../middlewares/validate.js";

const base = "/:workspaceId/projects/:projectId/tasks/:taskId/comment"

const router = Router();

router.post(
    base,
    authenticateUser,
    validate(addCommentSchema),
    addComment
);

router.get(
    base,
    authenticateUser,
    getCommentsByTask
);

router.patch(
    `${base}/:commentId`,
    authenticateUser,
    validate(editCommentSchema),
    editComment
);

router.delete(
    `${base}/:commentId`,
    authenticateUser,
    validate(deleteCommentParamsSchema, "params"),
    deleteComment
);

export default router;
