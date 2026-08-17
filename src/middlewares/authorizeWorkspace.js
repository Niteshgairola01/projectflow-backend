// import { HTTP_STATUS } from "../constants/httpStatus";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { findWorkspaceById } from "../repositories/workspace.repository.js";
import ApiError from "../utils/ApiError.js";

export const authorizeWorkspace = (...allowedRoles) => {
    return async (req, res, next) => {
        const { workspaceId } = req.params;
        const userId = req.user?.userId;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace id not found"
            );
        }

        const workspace = await findWorkspaceById(workspaceId);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        const member = workspace.members.find(member => member.user?._id.toString() === userId);

        if (!member) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You are not a member of this workspace"
            );
        }

        if (!allowedRoles.includes(member.role)) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You are not authorized to perform this action"
            );
        }

        // make workspace/member available to controllers
        req.workspace = workspace;
        req.workspaceMember = member;

        next();
    }
}