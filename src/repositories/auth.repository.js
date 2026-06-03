import User from "../models/user.model.js";

export const createUser = (userData) => {
    return User.create(userData);
}

export const findByEmail = (email) => {
    return User.findOne({ email });
}

export const findByEmailWithPassword = (email) => {
    return User.findOne({ email }).select("+password")
}

export const findById = (id) => {
    return User.findById(id)
}

export const updateRefreshToken = (userId, refreshToken) => {
    return User.findByIdAndUpdate(
        userId,
        { refreshToken },
        { new: true }
    );
}