import { HTTP_STATUS } from "../constants/httpStatus.js";
import { registerUser, loginUser, refreshAccessToken, logOutUser, getCurrentUser, getUser } from "../services/auth.service.js";
import ApiError from "../utils/ApiError.js";
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
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    user,
                    "User loggedin successfully"
                )
            )

    }
);

export const refreshToken = asyncHandler(
    async (req, res) => {
        const refreshToken = req.cookies.refreshToken;

        const result = await refreshAccessToken(refreshToken);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    result,
                    "Access token refreshed"
                )
            );
    }
);

export const logout = asyncHandler(
    async (req, res) => {
        const refreshToken = req.cookies.refreshToken;

        await logOutUser(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    "User logged out successfully"
                )
            )
    }
);

export const me = asyncHandler(
    async (req, res) => {
        const userId = req.user?.userId;

        const user = await getCurrentUser(userId);

        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    user,
                    "User fetched successfully"
                )
            )
    }
);

export const getUserById = asyncHandler(
    async (req, res) => {
        const userId = req?.params?.userId;
        const user = await getUser(userId);

        if (!user) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "User not found"
            );
        }


        return res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(
                    HTTP_STATUS.OK,
                    user,
                    "User fetched successfully"
                )
            );
    }
)