import { HTTP_STATUS } from "../../constants/httpStatus.js";
import { WORKSPACE_ROLE_PERMISSIONS } from "../../constants/rolePermissions.js";
import ApiError from "../ApiError.js";
import { hasPermission } from "../hasPermission.js";

export const authorizeWorkspacePermission = (
    workspace,
    userId,
    permission
) => {
    const member = workspace.members?.find(
        (member) =>
            member.user?._id?.toString() === userId?.toString() ||
            member.user?.toString() === userId?.toString()
    );

    if (!member) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not a member of this workspace"
        );
    }

    const allowed = hasPermission(
        member.role,
        permission,
        WORKSPACE_ROLE_PERMISSIONS
    );

    if (!allowed) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You do not have permission to perform this action"
        );
    }

    return member;
};