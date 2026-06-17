import { HTTP_STATUS } from "../constants/httpStatus.js";
// import { findWorkspaceById, findWorkspacesByUserId } from "../repositories/workspace.repository.js";
import { createNewWorkspace, fetchAllWorkspacesofUser, fetchWorkspaceById } from "../services/workspace.service.js";
import ApiError from "../utils/ApiError.js";
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
);

// get all
export const getAllWorkspacesOfUser = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;

        const workspaces = await fetchAllWorkspacesofUser(userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    workspaces,
                    "Fetch all workspaces for the user"
                )
            );
    }
);

// get by id
export const getWorkspaceById = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!id) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Please provide a valid workspace id"
            )
        }

        const workspace = await fetchWorkspaceById(id);

        if (!workspace) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Workspace not found"
            );
        }

        const isUserAMember = workspace.members.some(
            member => member.user._id.toString() === userId
        );

        if (!isUserAMember) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You do not have access to this workspace"
            )
        }


        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    workspace,
                    "Workspace fetched successfully"
                )
            )
    }
)