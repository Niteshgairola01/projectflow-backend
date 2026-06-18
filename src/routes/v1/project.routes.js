import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { createProject, getProjectById, getProjectsByWorkspaceId } from "../../controllers/project.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createProjectSchema } from "../../validations/project.validation.js";

const router = Router();

router.post("/:workspaceId/projects",
    authenticateUser,
    validate(createProjectSchema),
    createProject
);

router.get("/:workspaceId/projects",
    authenticateUser,
    getProjectsByWorkspaceId
);

router.get("/:workspaceId/projects/:projectId",
    authenticateUser,
    getProjectById
)

export default router;