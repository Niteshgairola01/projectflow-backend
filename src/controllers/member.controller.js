import { HTTP_STATUS } from "../constants/httpStatus.js";
import { deleteWorkspaceMember, fetchWorkspaceMembers, updateWorkspaceMember } from "../services/member.service.js";
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