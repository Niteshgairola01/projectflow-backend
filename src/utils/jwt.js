import jwt from "jsonwebtoken"
import { JWT_CONFIG } from "../constants/jwt.js"

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id, email: user.email
        },
        JWT_CONFIG.JWT_ACCESS_SECRET,
        {
            expiresIn: JWT_CONFIG.JWT_ACCESS_EXPIRES_IN
        }
    );
}

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id
        },
        JWT_CONFIG.JWT_REFRESH_SECRET,
        {
            expiresIn: JWT_CONFIG.JWT_REFRESH_EXPIRES_IN
        }
    );
}

export const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
}