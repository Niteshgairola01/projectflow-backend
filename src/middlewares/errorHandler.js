import { HTTP_STATUS } from "../constants/httpStatus.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || "Internal server error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack
        })
    })

}

export default errorHandler;