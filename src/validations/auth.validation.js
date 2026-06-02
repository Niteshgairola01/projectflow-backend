import z from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long"),
    email: z
        .string()
        .trim()
        .lowercase()
        .email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
});