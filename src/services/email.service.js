import nodemailer from "nodemailer";
import ApiError from "../utils/ApiError.js";

// Nodemailer only builds MIME content. Delivery uses HTTPS, never SMTP.
const composer = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "windows",
});

// Only log known codes. Provider messages can contain account or request data.
const googleFailureHints = {
    invalid_grant: "Refresh token expired or was revoked. Reauthorize the sender and replace GMAIL_REFRESH_TOKEN. Check whether the OAuth app is in Testing mode (seven-day token expiry).",
    invalid_client: "Check GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET against the OAuth client that issued the refresh token.",
    unauthorized_client: "The OAuth client is not authorized for this grant. Check the client configuration.",
    insufficientPermissions: "Reauthorize the sender with the gmail.send scope.",
    accessNotConfigured: "Enable the Gmail API in the OAuth client's Google Cloud project.",
    SERVICE_DISABLED: "Enable the Gmail API in the OAuth client's Google Cloud project.",
    rateLimitExceeded: "Google rate limit reached. Check Gmail API quotas.",
    userRateLimitExceeded: "Sender rate limit reached. Check Gmail sending limits.",
    dailyLimitExceeded: "Daily sending quota reached. Check Gmail sending limits.",
    authError: "Google rejected authorization. Reauthorize the sender and check the granted scopes.",
};

const requestGoogle = async (url, options, stage) => {
    let response;
    try {
        response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10_000),
        });
    } catch {
        console.error(`Gmail ${stage} failed: connection error or timeout`);
        throw new ApiError(503, `Email ${stage} timed out or could not connect. Please try again.`);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error(`Gmail ${stage} failed (HTTP ${response.status})`);
        const codes = [
            typeof result?.error === "string" ? result.error : undefined,
            ...(Array.isArray(result?.error?.errors) ? result.error.errors.map((error) => error?.reason) : []),
            ...(Array.isArray(result?.error?.details) ? result.error.details.map((detail) => detail?.reason) : []),
        ];
        for (const code of new Set(codes)) {
            if (Object.hasOwn(googleFailureHints, code)) {
                console.error(`Gmail ${stage}: ${code}. ${googleFailureHints[code]}`);
            }
        }
        throw new ApiError(503, `Email ${stage} failed. Check the Gmail API configuration on the server.`);
    }
    return result;
};

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    const required = [
        "GMAIL_CLIENT_ID",
        "GMAIL_CLIENT_SECRET",
        "GMAIL_REFRESH_TOKEN",
        "MAIL_FROM_EMAIL",
    ];
    const missing = required.filter((key) => !process.env[key]?.trim());
    if (missing.length) {
        console.error(`Missing email configuration: ${missing.join(", ")}`);
        throw new ApiError(503, "Email delivery is not configured. Contact the workspace administrator.");
    }

    const message = await composer.sendMail({
        from: {
            name: process.env.MAIL_FROM_NAME || "ProjectFlow",
            address: process.env.MAIL_FROM_EMAIL,
        },
        to,
        subject,
        html,
        attachments,
    });

    const token = await requestGoogle("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
    }, "authorization");

    if (!token.access_token) {
        throw new ApiError(503, "Gmail authorization did not return an access token.");
    }

    // Do not automatically retry sending: Google may have accepted a message
    // even if its response was lost, and retrying could deliver duplicates.
    return requestGoogle("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: message.message.toString("base64url") }),
    }, "delivery");
};
