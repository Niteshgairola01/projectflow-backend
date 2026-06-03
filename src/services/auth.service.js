import bcrypt from "bcrypt";
import { createUser, findByEmail, findByEmailWithPassword, updateRefreshToken } from "../repositories/auth.repository.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AUTH_CONFIG } from "../constants/auth.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

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