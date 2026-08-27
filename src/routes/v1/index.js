import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import projectRoutes from "./project.routes.js";
import taskRoutes from "./task.routes.js";
import memberRoutes from "./member.routes.js";
import invitationRoutes from "./invitation.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/workspaces", projectRoutes);
router.use("/workspaces", taskRoutes);
router.use("/workspaces", memberRoutes);
router.use("/workspaces", invitationRoutes);


export default router;