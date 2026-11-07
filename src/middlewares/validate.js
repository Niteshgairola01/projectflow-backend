import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js"
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const validate = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req[source]);
            req[source] = validatedData;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(
                    new ApiError(
                        HTTP_STATUS.BAD_REQUEST,
                        error.issues.map(issue => issue.message).join(", ")
                    )
                )
            }

            next(error);
        }
    }
}
