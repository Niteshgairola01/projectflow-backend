import { WORKSPACE_ROLE_PERMISSIONS } from "../../constants/rolePermissions.js";
import { hasPermission } from "../hasPermission.js";
import { authorizeProjectPermission } from "./authorizeProjectPermission.js";

export const authorizeProjectManagement = (
    workspace,
    project,
    userId,
    permission,
) => {
    const workspaceMember = workspace.members.find(
        (member) =>
            member.user?._id?.toString() === userId?.toString() ||
            member.user?.toString() === userId?.toString()
    );

    if (workspaceMember) {
        const hasWorkspacePermission = hasPermission(
            workspaceMember.role,
            permission,
            WORKSPACE_ROLE_PERMISSIONS
        );

        if (hasWorkspacePermission) {
            return {
                source: "WORKSPACE",
                member: workspaceMember,
            };
        }
    }

    const projectMember = authorizeProjectPermission(
        project,
        userId,
        permission
    );

    return {
        source: "PROJECT",
        member: projectMember,
    };
};