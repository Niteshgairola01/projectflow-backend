import { HTTP_STATUS } from "../constants/httpStatus.js";
import { createNewWorkspace } from "../services/workspace.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// create
export const createWorkspace = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;

        const workspace = await createNewWorkspace(req.body, userId);

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    workspace,
                    "Workspace created successfully"
                )
            )
    }
)