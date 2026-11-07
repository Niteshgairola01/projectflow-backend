import z from "zod";
import { objectIdSchema } from "../utils/objectSchema.js";

export const deleteCommentParamsSchema = z.object({
    workspaceId: objectIdSchema,
    projectId: objectIdSchema,
    taskId: objectIdSchema,
    commentId: objectIdSchema,
});

export const addCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(2, "Comment must be atleast 2 characters")
        .max(5000, "Comment is too long"),

    parentComment: z
        .union([objectIdSchema, z.literal(""), z.null()])
        .nullable()
        .optional()
        .transform((value) => value === "" ? null : value)
});

export const editCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(2, "Comment must be atleast 2 characters")
        .max(5000, "Comment is too long")
});
