import ApiError from "../utils/ApiError.js"
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { verifyToken } from "../utils/jwt.js";
import { JWT_CONFIG } from "../constants/jwt.js";

export const authenticateUser = async (req, res, next) => {
    try {

        const authHeader = req.headers["authorization"];

        // extract auth
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "Access token missing"
            )
        }

        // decode token
        const decoded = verifyToken(token, JWT_CONFIG.JWT_ACCESS_SECRET);

        // attach the decoded token payload to the request object
        req.user = {
            userId: decoded?.userId
        };

        next();
    } catch (error) {
        next(error);
    }
}