import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.js";
import { createProject, deleteProject, getProjectById, getProjectsByWorkspaceId, updateProject } from "../../controllers/project.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createProjectSchema, updateProjectSchema } from "../../validations/project.validation.js";
import { authorizeWorkspace } from "../../middlewares/authorizeWorkspace.js";
import { WORKSPACE_ROLES } from "../../constants/workspaceRoles.js";

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
);

router.patch("/:workspaceId/projects/:projectId",
    authenticateUser,
    validate(updateProjectSchema),
    updateProject
);

router.delete("/:workspaceId/projects/:projectId",
    authenticateUser,
    authorizeWorkspace(
        WORKSPACE_ROLES.ADMIN,
        WORKSPACE_ROLES.OWNER
    ),
    deleteProject
);


export default router;