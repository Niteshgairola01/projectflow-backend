import User from "../models/user.model.js";

export const createUser = (userData) => {
    return User.create(userData);
}

export const findByEmail = (email) => {
    return User.findOne({ email });
}

export const findByEmailWithPassword = async (email) => {
    return User.findOne({ email }).select("+password")
}

export const findById = (id) => {
    return User.findById(id)
}