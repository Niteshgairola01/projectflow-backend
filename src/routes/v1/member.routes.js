import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { getWorkspaceMembers } from "../../controllers/member.controller.js";

const router = Router();

router.get("/:workspaceId/members",
    authenticateUser,
    getWorkspaceMembers
);

export default router;