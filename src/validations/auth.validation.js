import z from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
});

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
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .lowercase()
        .email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long")
});

export const resetPasswordSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/, "This reset link is invalid or has expired."),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long")
        .refine((value) => Buffer.byteLength(value, "utf8") <= 72,
            "Password must be no more than 72 bytes"),
});
