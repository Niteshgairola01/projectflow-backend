import Workspace from "../models/workspace.model.js"

export const findMembersByWorkspace = (workspaceId) => {    
    return Workspace.findById(workspaceId)
        .populate("members.user", "name email avatar")
        .select("members")
        .lean();
}