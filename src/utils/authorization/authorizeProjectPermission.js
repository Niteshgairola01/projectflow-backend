import { HTTP_STATUS } from "../../constants/httpStatus.js";
import { PROJECT_ROLE_PERMISSIONS } from "../../constants/rolePermissions.js";
import ApiError from "../ApiError.js";
import { hasPermission } from "../hasPermission.js";

export const authorizeProjectPermission = (
    project,
    userId,
    permission
) => {
    const member = project.members.find(
        (member) =>
            member.user?._id?.toString() === userId?.toString() ||
            member.user?.toString() === userId?.toString()
    );

    if (!member) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You are not a member of this project"
        );
    }

    const allowed = hasPermission(
        member.role,
        permission,
        PROJECT_ROLE_PERMISSIONS
    );

    if (!allowed) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You do not have permission to perform this action"
        );
    }

    return member;
};