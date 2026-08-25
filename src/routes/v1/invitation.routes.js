import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { createInvitation } from "../../controllers/invitation.controller.js";

const router = Router();

router.post("/:workspaceId/invitations",
    authenticateUser,
    createInvitation
)

export default router;