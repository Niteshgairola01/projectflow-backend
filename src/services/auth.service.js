import bcrypt from "bcrypt";
import { createUser, findByEmail } from "../repositories/auth.repository.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AUTH_CONFIG } from "../constants/auth.js";

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