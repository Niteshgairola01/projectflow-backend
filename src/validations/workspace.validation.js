import z from "zod";

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            3,
            "Workspace name must be at least 3 characters"
        )
        .max(
            50,
            "Workspace name is too long"
        )
});