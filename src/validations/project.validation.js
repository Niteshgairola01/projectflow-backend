import z from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Project name must be at least 3 characters")
        .max(100, "Project name is too long"),

    description: z
        .string()
        .trim()
        .max(500, "Description is too long")
        .optional(),

    color: z
        .string()
        .trim()
        .optional(),

    startDate: z
        .string()
        .optional(),

    endDate: z
        .string()
        .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();