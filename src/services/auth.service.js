import bcrypt from "bcrypt";
import { createUser, findByEmail, findByEmailWithPassword, findById, findByRefreshToken, updateRefreshToken } from "../repositories/auth.repository.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AUTH_CONFIG } from "../constants/auth.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js";
import { JWT_CONFIG } from "../constants/jwt.js";

export const registerUser = async (data) => {
    const { name, email, password } = data;

    // check existing user
    const doesUserExist = await findByEmail(email);

    if (doesUserExist) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Email already exists`
        );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);

    const user = await createUser({
        name,
        email,
        password: hashedPassword
    });

    return {
        _id: user._id,
        name: user.name,
        email: user.email
    }
}

export const loginUser = async (data) => {
    const { email, password } = data;

    // fetch user by email
    const user = await findByEmailWithPassword(email);

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid email or password"
        );
    }

    // verify passowrd
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(
            400,
            "Invalid password"
        );
    }

    // generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refresh token to DB
    await updateRefreshToken(user._id, refreshToken);

    // return tokens and user details (excluding password)
    const { password: _, ...userPayload } = user.toObject ? user.toObject() : user

    return {
        accessToken,
        refreshToken,
        user: userPayload
    }
}

export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Refresh token missing"
        );
    }

    // veify jwt sign and expireation
    const decoded = verifyToken(refreshToken, JWT_CONFIG.JWT_REFRESH_SECRET);

    // fetch user from DB to check if token matches    
    const user = await findById(decoded.userId);
    if (!user) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid refresh token session"
        );
    }

    const newAccessToken = generateAccessToken(user);

    return {
        accessToken: newAccessToken
    }
}