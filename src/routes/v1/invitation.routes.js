import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { acceptInvitation, createInvitation, getInvitationByToken, getPendingInvitations } from "../../controllers/invitation.controller.js";

const router = Router();

router.post("/:workspaceId/invitations",
    authenticateUser,
    createInvitation
);

router.get("/:workspaceId/invitations/:token",
    authenticateUser,
    getInvitationByToken
);

router.get("/invitations/my-pending",
    authenticateUser,
    getPendingInvitations
);

router.post("/:workspaceId/invitations/:token/accept",
    authenticateUser,
    acceptInvitation
);

export default router;