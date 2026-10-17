import mongoose from "mongoose";
import Workspace from "../models/workspace.model.js";

export const createWorkspace = (workspaceData) => {
    return Workspace.create(workspaceData);
}

export const findWorkspacesByUserId = (userId) => {
    return Workspace.find({ "members.user": userId }).populate("members.user", "name email");
}

export const findWorkspaceById = (id) => {
    return Workspace.findById(id)
        .populate("members.user", "name email")
}

export const findWorkspace = (workspaceId) => {
    return Workspace.findById(workspaceId);
}

export const findWorkspacesWithProjectCount = async (userId) => {
    const workspaces = await Workspace.aggregate([
        {
            $match: {
                "members.user": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "projects",
                let: { workspaceId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$workspace", "$$workspaceId"]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                as: "projectStats"
            }
        },
        {
            $set: {
                projectsCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$projectStats.count", 0] },
                        0
                    ]
                }
            }
        },
        {
            $unset: "projectStats"
        }
    ]);

    // Aggregations don't automatically apply Mongoose populate().
    return Workspace.populate(workspaces, {
        path: "members.user",
        select: "name email"
    });
}

export const findWorkspaceWithProjectCount = async (
    workspaceId,
    userId
) => {
    const [workspace] = await Workspace.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(workspaceId),
                "members.user": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "projects",
                let: { workspaceId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$workspace", "$$workspaceId"]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                as: "projectStats"
            }
        },
        {
            $set: {
                projectsCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$projectStats.count", 0] },
                        0
                    ]
                }
            }
        },
        {
            $unset: "projectStats"
        }
    ]);

    if (!workspace) return null;

    return Workspace.populate(workspace, {
        path: "members.user",
        select: "name email"
    });
};
