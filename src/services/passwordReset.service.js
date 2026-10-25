import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { AUTH_CONFIG } from "../constants/auth.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { createHash, randomBytes } from "node:crypto";
import { savePasswordReset, removePasswordReset, findValidPasswordReset, consumePasswordReset } from "../repositories/passwordReset.repository.js";
import { sendEmail } from "./email.service.js";
import ApiError from "../utils/ApiError.js";

export const PASSWORD_RESET_MESSAGE = "If an account exists with this email, we’ve sent a password reset link.";
export const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;

const logoAttachment = () => ({
    filename: "projectflow-logo.png",
    path: fileURLToPath(new URL("../assets/projectflow-logo.png", import.meta.url)),
    cid: "projectflow-logo@projectflow",
    contentType: "image/png",
    contentDisposition: "inline",
});

const emailBrandHeader = `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td width="44" style="width:44px;vertical-align:middle;">
            <img src="cid:projectflow-logo@projectflow" alt="ProjectFlow logo" width="34" height="34" style="display:block;width:34px;height:34px;border:0;" />
        </td>
        <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#4f46e5;">ProjectFlow</td>
    </tr>
</table>`;


const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

export const createPasswordResetRequester = ({
    save = savePasswordReset,
    remove = removePasswordReset,
    send = sendEmail,
    clientUrl = () => process.env.CLIENT_URL,
    clock = () => new Date(),
    logError = () => console.error("Password reset email delivery failed"),
} = {}) => async (email) => {

    // Validate configuration for every request, independently of account existence.
    let resetUrl;

    try {
        const base = new URL(clientUrl());
        if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) throw new Error();
        resetUrl = new URL("/reset-password", base);
    } catch {
        throw new ApiError(503, "Password reset is temporarily unavailable. Please try again later.");
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const now = clock();
    const user = await save({
        email,
        tokenHash,
        expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
        now,
        cooldownMs: PASSWORD_RESET_COOLDOWN_MS,
    });
    // Missing accounts and requests inside the cooldown get the same response.
    if (!user) return;

    resetUrl.searchParams.set("token", token);
    const link = escapeHtml(resetUrl.toString());
    try {
        await send({
            to: user.email,
            subject: "Reset your ProjectFlow password",
            attachments: [logoAttachment()],
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="x-apple-disable-message-reformatting" />
                <title>Reset your ProjectFlow password</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
                <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Reset your ProjectFlow password. Your secure link expires in 15 minutes.</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ff;">
                    <tr><td align="center" style="padding:40px 16px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                            <tr><td style="padding:24px 28px;border-bottom:1px solid #ede9fe;">
                                ${emailBrandHeader}
                            </td></tr>
                            <tr><td style="padding:32px 28px 28px;">
                                <p style="margin:0 0 12px;font-size:12px;line-height:20px;font-weight:700;letter-spacing:1px;color:#4f46e5;">ACCOUNT RECOVERY</p>
                                <h1 style="margin:0 0 12px;font-size:26px;line-height:34px;letter-spacing:-0.5px;color:#0f172a;">Let’s get you back in</h1>
                                <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#475569;">We received a request to reset your ProjectFlow password. Choose a new password to get back to your projects and tasks.</p>
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                                    <tr><td align="center" bgcolor="#4f46e5" style="border-radius:8px;mso-padding-alt:14px 24px;">
                                        <a href="${link}" style="display:inline-block;padding:14px 24px;border:1px solid #4f46e5;border-radius:8px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;">Reset password &rarr;</a>
                                    </td></tr>
                                </table>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ff;border:1px solid #ede9fe;border-radius:10px;">
                                    <tr><td style="padding:16px 18px;">
                                        <p style="margin:0 0 4px;font-size:14px;font-weight:700;line-height:22px;color:#4338ca;">Valid for 15 minutes &middot; One-time use</p>
                                        <p style="margin:0;font-size:13px;line-height:21px;color:#64748b;">For your security, this link can be used for one successful password reset. Please don’t share it with anyone.</p>
                                    </td></tr>
                                </table>
                                <p style="margin:24px 0 8px;font-size:12px;line-height:20px;color:#64748b;">Button not working? Copy and paste this link into your browser:</p>
                                <p style="margin:0;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a href="${link}" style="color:#4f46e5;text-decoration:underline;">${link}</a></p>
                            </td></tr>
                            <tr><td style="padding:20px 28px;background-color:#fafafa;border-top:1px solid #f1f5f9;">
                                <p style="margin:0 0 6px;font-size:13px;font-weight:700;line-height:20px;color:#475569;">Didn’t request a reset?</p>
                                <p style="margin:0;font-size:12px;line-height:20px;color:#64748b;">You can safely ignore this email. Your password hasn’t changed.</p>
                            </td></tr>
                        </table>
                        <p style="margin:20px 0 0;font-size:12px;line-height:20px;color:#94a3b8;">ProjectFlow &middot; Keep your work moving.</p>
                    </td></tr>
                </table>
            </body>
            </html>`,
        });
    } catch {
        logError();
        try {
            await remove(user._id, tokenHash);
        } catch {
            // Do not reveal whether an account exists through delivery/cleanup errors.
            logError();
        }
    }
};

export const requestPasswordReset = createPasswordResetRequester();


export const resetPassword = async ({ token, password }) => {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const user = await findValidPasswordReset(tokenHash, new Date());
    const invalidLink = () => new ApiError(HTTP_STATUS.BAD_REQUEST, "This reset link is invalid or has expired.");
    if (!user) throw invalidLink();

    const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);
    const updatedUser = await consumePasswordReset({
        userId: user._id,
        tokenHash,
        passwordHash,
        now: new Date(),
    });
    // Also rejects reuse, replacement, or expiry while the password was hashing.
    if (!updatedUser) throw invalidLink();

    try {
        await sendEmail({
            to: updatedUser.email,
            subject: "Your ProjectFlow password has changed",
            attachments: [logoAttachment()],
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Your password has been updated</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
                <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your ProjectFlow password has been updated. You can sign in with your new password.</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3ff;">
                    <tr><td align="center" style="padding:40px 16px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                            <tr><td style="padding:24px 28px;border-bottom:1px solid #ede9fe;">
                                ${emailBrandHeader}
                            </td></tr>
                            <tr><td style="padding:32px 28px 28px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                    <tr><td align="center" width="48" height="48" style="width:48px;height:48px;border-radius:24px;background-color:#ecfdf5;color:#047857;font-size:26px;font-weight:700;line-height:48px;">&#10003;</td></tr>
                                </table>
                                <h1 style="margin:20px 0 12px;font-size:26px;line-height:34px;letter-spacing:-0.5px;color:#0f172a;">Password updated</h1>
                                <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#475569;">Your ProjectFlow password has been successfully changed.</p>
                                <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#475569;">You’re ready to get back to work. Sign in with your new password to continue managing your projects and tasks.</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
                                    <tr><td style="padding:16px 18px;">
                                        <p style="margin:0 0 6px;font-size:14px;font-weight:700;line-height:22px;color:#92400e;">Didn’t make this change?</p>
                                        <p style="margin:0;font-size:13px;line-height:21px;color:#92400e;">Request a new password reset immediately from the login page and contact support.</p>
                                    </td></tr>
                                </table>
                            </td></tr>
                            <tr><td style="padding:20px 28px;background-color:#fafafa;border-top:1px solid #f1f5f9;">
                                <p style="margin:0;font-size:12px;line-height:20px;color:#64748b;">This is a security notification from ProjectFlow. We’ll never ask you to share your password by email.</p>
                            </td></tr>
                        </table>
                        <p style="margin:20px 0 0;font-size:12px;line-height:20px;color:#94a3b8;">ProjectFlow &middot; Keep your work moving.</p>
                    </td></tr>
                </table>
            </body>
            </html>`,
        });
    } catch {
        // The password change is already committed; notification failure must
        // not make the client retry an already consumed reset link.
        console.error("Password change notification delivery failed");
    }
};
