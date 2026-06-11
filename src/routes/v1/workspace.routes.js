import { Router } from "express";
import { createWorkspace, getAllWorkspacesOfUser, getWorkspaceById } from "../../controllers/workspace.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createWorkspaceSchema } from "../../validations/workspace.validation.js";
import { authenticateUser } from "../../middlewares/auth.js";

const router = Router();

router.post("/",
    authenticateUser,
    validate(createWorkspaceSchema),
    createWorkspace
);

router.get("/",
    authenticateUser,
    getAllWorkspacesOfUser
);

router.get("/:id",
    authenticateUser,
    getWorkspaceById
);

export default router;