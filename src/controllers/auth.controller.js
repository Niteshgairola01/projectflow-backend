import { HTTP_STATUS } from "../constants/httpStatus.js";
import { registerUser } from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(
    async (req, res) => {
        const user = await registerUser(req.body);

        return res
            .status(HTTP_STATUS.CREATED)
            .json(
                new ApiResponse(
                    HTTP_STATUS.CREATED,
                    user,
                    "User registered successfully"
                )
            );
    }
);