import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { acceptInvitation, createInvitation, getInvitationByToken, getPendingInvitations, getWorkspaceInvitations } from "../../controllers/invitation.controller.js";

const router = Router();

router.post("/:workspaceId/invitations",
    authenticateUser,
    createInvitation
);

router.get("/invitations/my-pending",
    authenticateUser,
    getPendingInvitations
);

router.get("/invitations/:token",
    getInvitationByToken
);

router.get("/:workspaceId/invitations",
    authenticateUser,
    getWorkspaceInvitations
);

router.post("/:workspaceId/invitations/:token/accept",
    authenticateUser,
    acceptInvitation
);

export default router;