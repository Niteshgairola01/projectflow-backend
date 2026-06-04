import { HTTP_STATUS } from "../constants/httpStatus.js";
import ApiError from "../utils/ApiError.js";

const notFound = (req, res, next) => {
    next(
        new ApiError(
            HTTP_STATUS.NOT_FOUND,
            `Route not found: ${req.originalUrl}`
        )
    );
}

export default notFound;