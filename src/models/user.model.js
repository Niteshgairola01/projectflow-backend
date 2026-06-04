import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    avatar: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Passowrd is required"],
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        defalt: false
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

UserSchema.index({ email: 2 });

export default mongoose.model("User", UserSchema);