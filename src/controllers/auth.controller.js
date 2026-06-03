import { HTTP_STATUS } from "../constants/httpStatus.js";
import { registerUser, loginUser } from "../services/auth.service.js";
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

export const login = asyncHandler(
    async (req, res) => {
        const user = await loginUser(req.body);

        res.cookie(
            "refreshToken",
            user.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    user,
                    "User loggedin successfully"
                )
            )

    }
)