import { HTTP_STATUS } from "../constants/httpStatus.js";
import { findWorkspaceById } from "../repositories/workspace.repository.js";
import { acceptWorkspaceInvitation, createNewInvitation, fetchInvitationByToken, fetchPendingInvitations, fetchWorkspaceInvitations } from "../services/invitation.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createInvitation = asyncHandler(
    async (req, res) => {
        const { workspaceId } = req.params;
        const userId = req.user?.userId;

        const email = req.body.email;
        if (!email) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Email not found"
            );
        }

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace ID is required"
            );
        }

        const invitation = await createNewInvitation(workspaceId, email, userId);

        res.status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    invitation,
                    "Invitation sent successfully"
                )
            )
    }
);

export const getInvitationByToken = asyncHandler(
    async (req, res) => {
        const { workspaceId, token } = req.params;

        const workspace = await findWorkspaceById(workspaceId);
        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        if (!token) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Token not found"
            );
        }

        const invitaion = await fetchInvitationByToken(token, workspaceId);

        return res.status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    invitaion,
                    "Invitation fetched successfully"
                )
            );
    }
);

export const getWorkspaceInvitations = asyncHandler(
    async (req, res) => {
        const { workspaceId } = req.params;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace id not found"
            );
        }

        const invitations = await fetchWorkspaceInvitations(workspaceId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    invitations,
                    "Workspacee invitations fetched successfully"
                )
            );

    }
)

export const getPendingInvitations = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "User authentication required"
            );
        }

        const invitations = await fetchPendingInvitations(userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    invitations,
                    "Pending invitations fetched successfully"
                )
            );

    }
);

export const acceptInvitation = asyncHandler(
    async (req, res) => {
        const { workspaceId, token } = req.params;
        const userId = req.user?.userId;

        if (!workspaceId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Workspace ID is required"
            );
        }

        if (!token) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Invitation token is required"
            );
        }

        if (!userId) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "User authentication required"
            );
        }

        const result = await acceptWorkspaceInvitation(workspaceId, token, userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    result,
                    "Invitation accepted successfully"
                )
            );
    }
);