import mongoose from "mongoose";
import User from "../models/user.model.js";
import { escapeSearch } from "../validations/list.validation.js";

// Members are embedded; unwind and join users before searching and paginating.
export async function findMemberPage(Model, match, { search, page, limit }) {
    const searchMatch = search ? { $or: [
        { "user.name": { $regex: escapeSearch(search), $options: "i" } },
        { "user.email": { $regex: escapeSearch(search), $options: "i" } },
    ] } : {};
    const pipeline = [
        { $match: Object.fromEntries(Object.entries(match).map(([key, value]) => [key, new mongoose.Types.ObjectId(value)])) },
        { $unwind: "$members" },
        { $lookup: { from: User.collection.name, localField: "members.user", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { _id: "$members._id", role: "$members.role", user: { _id: "$user._id", name: "$user.name", email: "$user.email", avatar: "$user.avatar" } } },
        { $facet: {
            totalMembers: [{ $count: "count" }],
            matching: [{ $match: searchMatch }, { $count: "count" }],
            members: [
                { $match: searchMatch },
                { $sort: { "user.name": 1, "user._id": 1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ],
        } },
    ];
    const [result] = await Model.aggregate(pipeline);
    const total = result?.matching[0]?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    // Refetch the last valid page if a removal made the requested page empty.
    if (page > totalPages) return findMemberPage(Model, match, { search, page: totalPages, limit });
    return { members: result?.members ?? [], total, page, totalPages, limit, totalMembers: result?.totalMembers[0]?.count ?? 0 };
}
