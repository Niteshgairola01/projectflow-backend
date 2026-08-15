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

export const findByRefreshToken = (refreshToken) => {
    return User.findOne({ refreshToken });
}

export const clearRefreshToken = (userId) => {
    return User.findByIdAndUpdate(
        userId,
        { refreshToken: null }
    );
}

export const findByIdWithoutRefreshToken = (userId) => {
    return User.findById(userId).select('-refreshToken');
}

export const findUserById = (userId) => {
    return User.findById(userId).select('-refreshToken');
} 