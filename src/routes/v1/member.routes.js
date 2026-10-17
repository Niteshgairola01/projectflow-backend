import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { createProjectMember, getProjectMembers, getWorkspaceMembers, removeProjectMember, removeWorkspaceMember, updateProjectMemberRole, updateWorkspaceMemberRole } from "../../controllers/member.controller.js";

const router = Router();

router.get("/:workspaceId/members",
    authenticateUser,
    getWorkspaceMembers
);

router.patch(
    "/:workspaceId/members/:userId",
    authenticateUser,
    updateWorkspaceMemberRole
);

router.delete(
    "/:workspaceId/members/:userId",
    authenticateUser,
    removeWorkspaceMember
);

// project members
router.get(
    "/:workspaceId/projects/:projectId/members",
    authenticateUser,
    getProjectMembers
);

router.post(
    "/:workspaceId/projects/:projectId/members",
    authenticateUser,
    createProjectMember
);

router.patch(
    "/:workspaceId/projects/:projectId/members/:userId",
    authenticateUser,
    updateProjectMemberRole
);

router.delete(
    "/:workspaceId/projects/:projectId/members/:userId",
    authenticateUser,
    removeProjectMember
);

export default router;