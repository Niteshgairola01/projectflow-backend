import { HTTP_STATUS } from "../constants/httpStatus.js";
import { addNewProjectMember, deleteProjectMember, deleteWorkspaceMember, fetchProjectMembers, fetchWorkspaceMembers, updateProjectMember, updateWorkspaceMember } from "../services/member.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getWorkspaceMembers = asyncHandler(
    async (req, res) => {
        const { workspaceId } = req.params;
        const userId = req.user?.userId

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace id not found"
            );
        }

        const members = await fetchWorkspaceMembers(workspaceId, userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    members,
                    "Members fetched successfully"
                )
            );

    }
);

export const updateWorkspaceMemberRole = asyncHandler(
    async (req, res) => {
        const { workspaceId, userId } = req.params;
        const requestedBy = req.user?.userId;
        const { role } = req.body;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace id is required"
            );
        }

        if (!userId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "User id is required"
            );
        }

        if (!role) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Role is required"
            );
        }

        const updatedMember = await updateWorkspaceMember(
            workspaceId,
            userId,
            role,
            requestedBy
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    updatedMember,
                    "Member role updated successfully"
                )
            );
    }
)

export const removeWorkspaceMember = asyncHandler(
    async (req, res) => {
        const { workspaceId, userId } = req.params;
        const requestedBy = req.user?.userId;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace id is required"
            );
        }

        if (!userId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "User id is required"
            );
        }

        await deleteWorkspaceMember(workspaceId, userId, requestedBy);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    null,
                    "Member removed successfully"
                )
            );
    }
);


// project members
export const getProjectMembers = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId } = req.params;
        const requestedBy = req.user?.userId;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace id is required"
            );
        }

        if (!projectId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Project id is required"
            );
        }

        const members = await fetchProjectMembers(
            workspaceId,
            projectId,
            requestedBy
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    members,
                    "Project members fetched successfully"
                )
            );
    }
);


export const createProjectMember = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId } = req.params;
        const requestedBy = req.user?.userId;

        const { userId, role } = req.body;

        if (!userId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "User id is required"
            );
        }

        if (!role) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Role is required"
            );
        }

        const member = await addNewProjectMember(
            workspaceId,
            projectId,
            userId,
            role,
            requestedBy
        );

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    member,
                    "Member added to project successfully"
                )
            );
    }
);

export const updateProjectMemberRole = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId, userId } = req.params;
        const requestedBy = req.user?.userId;

        const { role } = req.body;

        if (!role) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Role is required"
            );
        }

        const member = await updateProjectMember(
            workspaceId,
            projectId,
            userId,
            role,
            requestedBy
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    member,
                    "Project member role updated successfully"
                )
            );
    }
);

export const removeProjectMember = asyncHandler(
    async (req, res) => {
        const { workspaceId, projectId, userId } = req.params;
        const requestedBy = req.user?.userId;

        await deleteProjectMember(
            workspaceId,
            projectId,
            userId,
            requestedBy
        );

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    null,
                    "Member removed from project successfully"
                )
            );
    }
);