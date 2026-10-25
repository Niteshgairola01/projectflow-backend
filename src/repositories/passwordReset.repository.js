import User from "../models/user.model.js";

// Claim the resend window atomically, including across server instances.
export const savePasswordReset = ({ email, tokenHash, expiresAt, now, cooldownMs }) => {
    return User.findOneAndUpdate(
        {
            email,
            $or: [
                { passwordResetRequestedAt: { $exists: false } },
                { passwordResetRequestedAt: null },
                { passwordResetRequestedAt: { $lte: new Date(now.getTime() - cooldownMs) } },
            ],
        },
        {
            $set: {
                passwordResetToken: tokenHash,
                passwordResetExpires: expiresAt,
                passwordResetRequestedAt: now,
            }
        },
        { new: true },
    ).select("email");
};

// A failed older delivery must not erase a more recent reset request.
export const removePasswordReset = (userId, tokenHash) => {
    return User.updateOne(
        { _id: userId, passwordResetToken: tokenHash },
        { $unset: { passwordResetToken: 1, passwordResetExpires: 1, passwordResetRequestedAt: 1 } },
    );
};


export const findValidPasswordReset = (tokenHash, now) => {
    return User.findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: now },
    }).select("_id");
};

// Check validity again when writing: only one concurrent reset can match.
export const consumePasswordReset = ({ userId, tokenHash, passwordHash, now }) => {
    return User.findOneAndUpdate(
        {
            _id: userId,
            passwordResetToken: tokenHash,
            passwordResetExpires: { $gt: now },
        },
        {
            $set: { password: passwordHash, refreshToken: null },
            $unset: { passwordResetToken: 1, passwordResetExpires: 1, passwordResetRequestedAt: 1 },
        },
        { new: true, runValidators: true },
    ).select("email");
};
