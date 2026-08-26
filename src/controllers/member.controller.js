import { HTTP_STATUS } from "../constants/httpStatus.js";
import { fetchWorkspaceMembers } from "../services/member.service.js";
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
)