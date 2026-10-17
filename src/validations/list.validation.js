import z from "zod";
import ApiError from "../utils/ApiError.js";

const search = z.string().trim().max(200).optional().default("");
export const taskFiltersSchema = z.object({
    search,
    status: z.enum(["", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    priority: z.enum(["", "HIGH", "MEDIUM", "LOW"]).optional(),
    assignee: z.union([z.literal(""), z.literal("unassigned"), z.string().regex(/^[a-fA-F0-9]{24}$/)]).optional(),
    filtered: z.enum(["true"]).optional(),
});
export const memberFiltersSchema = z.object({
    search,
    page: z.coerce.number().int().min(1).max(1000000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});
export function parseListQuery(schema, query) {
    const result = schema.safeParse(query);
    if (!result.success) throw new ApiError(400, "Invalid list filters or pagination parameters");
    return result.data;
}
export const escapeSearch = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
