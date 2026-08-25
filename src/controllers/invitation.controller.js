import { HTTP_STATUS } from "../constants/httpStatus.js";
import { createNewInvitation } from "../services/invitation.service.js";
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
)