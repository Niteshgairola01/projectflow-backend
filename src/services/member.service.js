import { HTTP_STATUS } from "../constants/httpStatus.js"
import { findMembersByWorkspace } from "../repositories/member.repository.js";
import ApiError from "../utils/ApiError.js"

export const fetchWorkspaceMembers = async (workspaceId, userId) => {
    const workspace = await findMembersByWorkspace(workspaceId, userId);

    if (!workspace) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Workspace not found"
        );
    }

    const isMember = workspace.members.some(member => member.user._id?.toString() === userId);

    if (!isMember) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "User is not a member of workspace"
        )
    }

    return workspace.members;
}