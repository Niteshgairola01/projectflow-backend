import { createTask, deleteTask, getTaskById, getTasksByProject, updateTask } from "../../controllers/task.controller.js";
import { authenticateUser } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { createTaskSchema, updateTaskSchema } from "../../validations/task.validation.js";
import router from "./project.routes.js";

router.post("/:workspaceId/projects/:projectId/tasks",
    authenticateUser,
    validate(createTaskSchema),
    createTask
);

router.patch("/:workspaceId/projects/:projectId/tasks/:taskId",
    authenticateUser,
    validate(updateTaskSchema),
    updateTask
);

router.get("/:workspaceId/projects/:projectId/tasks",
    authenticateUser,
    getTasksByProject
);

router.get("/:workspaceId/projects/:projectId/tasks/:taskId",
    authenticateUser,
    getTaskById
);

router.delete("/:workspaceId/projects/:projectId/tasks/:taskId",
    authenticateUser,
    deleteTask
);

export default router;