import nodemailer from "nodemailer";
import ApiError from "../utils/ApiError.js";

// Nodemailer only builds MIME content. Delivery uses HTTPS, never SMTP.
const composer = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "windows",
});

const requestGoogle = async (url, options, stage) => {
    let response;
    try {
        response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10_000),
        });
    } catch {
        throw new ApiError(503, `Email ${stage} timed out or could not connect. Please try again.`);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        // Do not expose OAuth credentials, tokens, or Google's response body.
        console.error(`Gmail ${stage} failed (HTTP ${response.status})`);
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
