import { Router } from "express";
import { createWorkspace } from "../../controllers/workspace.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createWorkspaceSchema } from "../../validations/workspace.validation.js";
import { authenticateUser } from "../../middlewares/auth.js";

const router = Router();

router.post("/create",
    authenticateUser,
    validate(createWorkspaceSchema),
    createWorkspace
);

export default router;