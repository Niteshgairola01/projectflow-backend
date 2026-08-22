import z from "zod";

const TASK_STATUS = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
];

const TASK_PRIORITY = [
    "HIGH",
    "MEDIUM",
    "LOW",
];

const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid ObjectId"
    );

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Task title is required")
        .max(200, "Task title cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),

    assignedTo: z.string().optional(),
    // assignedTo: objectIdSchema.optional(),

    status: z
        .enum(TASK_STATUS)
        .optional(),

    priority: z
        .enum(TASK_PRIORITY)
        .optional(),

    dueDate: z
        .coerce
        .date()
        .optional(),
});

export const updateTaskSchema = createTaskSchema.partial();