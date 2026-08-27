import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { getWorkspaceMembers, removeWorkspaceMember, updateWorkspaceMemberRole } from "../../controllers/member.controller.js";

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

export default router;